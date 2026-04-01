package engine

import (
	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"
	"crypto-exchange-backend/ws" // nhap package ws moi de khong bi loi vong lap (circular import)
	"fmt"
	"strings"
	"sync"
)

// mu x dung de dam bao tai mot thoi diem chi co mot luong khop lenh chay
var mutex sync.Mutex

// RunMatchingEngine chay thuat toan fifo khop lenh
func RunMatchingEngine(symbol string) {
	mutex.Lock()
	defer mutex.Unlock()

	fmt.Printf("--- matching engine dang kiem tra: %s ---\n", symbol)

	// tim tat ca cac lenh mua dang cho (open/partial)
	var buyorders []models.Order
	config.DB.Where("symbol = ? AND side = ? AND status IN (?, ?)", symbol, "BUY", "OPEN", "PARTIAL").
		Order("price desc, created_at asc").Find(&buyorders)

	// tim tat ca cac lenh ban dang cho (open/partial)
	var sellorders []models.Order
	config.DB.Where("symbol = ? AND side = ? AND status IN (?, ?)", symbol, "SELL", "OPEN", "PARTIAL").
		Order("price asc, created_at asc").Find(&sellorders)

	fmt.Printf("tim thay %d lenh mua va %d lenh ban dang cho\n", len(buyorders), len(sellorders))

	// duyet qua tung lenh mua va sell de tim cap khop
	for i := 0; i < len(buyorders); i++ {
		buy := &buyorders[i]

		for j := 0; j < len(sellorders); j++ {
			sell := &sellorders[j]

			// neu gia mua lon hon hoac bang gia ban thi khop duoc
			if buy.Price >= sell.Price {
				fmt.Printf("phat hien cap khop: mua %f vs ban %f\n", buy.Price, sell.Price)

				// tinh toan khoi luong khop lenh (lay gia tri thap nhat cua 2 ben)
				buyrem := buy.Quantity - buy.Filled
				sellrem := sell.Quantity - sell.Filled
				matchqty := buyrem
				if sellrem < matchqty {
					matchqty = sellrem
				}

				if matchqty <= 0 {
					continue
				}

				// gia khop lenh duoc lay theo gia cua nguoi dat lenh truoc (taker/maker logic don gian)
				matchprice := sell.Price
				if buy.CreatedAt.Before(sell.CreatedAt) {
					matchprice = buy.Price
				}

				fmt.Printf("dang khop lenh voi gia %f, so luong %f\n", matchprice, matchqty)

				// thuc hien giao dich khop lenh trong database
				if err := processTrade(buy, sell, matchprice, matchqty); err != nil {
					fmt.Printf("loi khi xu ly khop lenh: %v\n", err)
				} else {
					fmt.Println("khop lenh thanh cong!")
					// cap nhat lai so luong da khop trong RAM de vong lap tiep theo chay dung
					buy.Filled += matchqty
					sell.Filled += matchqty

					// neu lenh nao da khop het thi bo qua
					if buy.Filled >= buy.Quantity {
						buy.Status = "FILLED"
						break
					}
				}
			}
		}
	}
}

// processtrade thuc hien cap nhat ví, trang thai lenh va luu lich su trade
func processTrade(buy *models.Order, sell *models.Order, price float64, qty float64) error {
	tx := config.DB.Begin()

	// 1. cap nhat trang thai hai lenh
	buy.Filled += qty
	if buy.Filled >= buy.Quantity {
		buy.Status = "FILLED"
	} else {
		buy.Status = "PARTIAL"
	}

	sell.Filled += qty
	if sell.Filled >= sell.Quantity {
		sell.Status = "FILLED"
	} else {
		sell.Status = "PARTIAL"
	}

	if err := tx.Save(buy).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Save(sell).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 2. cap nhat ví cua hai nguoi dung (chuyen tai san tu nguoi ban sang nguoi mua va nguoc lai)
	// phan nay thuc hien chuyen asset (vd: btc) cho nguoi mua va quote (vd: usdt) cho nguoi ban

	parts := strings.Split(buy.Symbol, "_")
	baseAsset := strings.ToUpper(parts[0])  // chuyen sang viet hoa de khop voi auth.go
	quoteAsset := strings.ToUpper(parts[1]) // chuyen sang viet hoa de khop voi auth.go

	var buyervital models.Wallet   // vi cua nguoi mua (nhan: btc)
	var buyerviquote models.Wallet  // vi cua nguoi mua (locked: usdt)
	var sellervital models.Wallet  // vi cua nguoi ban (locked: btc)
	var sellerviquote models.Wallet // vi cua nguoi ban (nhan: usdt)

	// lay vi cua nguoi mua
	tx.Where("user_id = ? AND asset = ?", buy.UserID, baseAsset).First(&buyervital)
	tx.Where("user_id = ? AND asset = ?", buy.UserID, quoteAsset).First(&buyerviquote)
	// lay vi cua nguoi ban
	tx.Where("user_id = ? AND asset = ?", sell.UserID, baseAsset).First(&sellervital)
	tx.Where("user_id = ? AND asset = ?", sell.UserID, quoteAsset).First(&sellerviquote)

	// nguoi mua nhan btc, mat usdt dang locked
	buyervital.Balance += qty
	spentusdt := qty * price
	lockedspent := qty * buy.Price // day la so tien usdt bi khoa luc dau
	buyerviquote.LockedBalance -= lockedspent
	// neu gia khop re hon gia dat mua (buy limit > match price) thi hoan usdt du lai balance
	if (lockedspent - spentusdt) > 0 {
		buyerviquote.Balance += (lockedspent - spentusdt)
	}

	// nguoi ban mat btc locked, nhan usdt
	sellervital.LockedBalance -= qty
	sellerviquote.Balance += spentusdt

	tx.Save(&buyervital)
	tx.Save(&buyerviquote)
	tx.Save(&sellervital)
	tx.Save(&sellerviquote)

	// 3. tao ban ghi lich su giao dich (trade)
	trade := models.Trade{
		BuyOrderID:  buy.ID,
		SellOrderID: sell.ID,
		Symbol:      buy.Symbol,
		Price:       price,
		Quantity:    qty,
	}
	if err := tx.Create(&trade).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 4. thong bao cho moi nguoi qua websocket
	go ws.BroadcastMarketData(map[string]interface{}{
		"type":    "TRADE_EXECUTED",
		"symbol":  buy.Symbol,
		"price":   price,
		"quantity": qty,
		"time":    trade.CreatedAt,
	})

	return tx.Commit().Error
}

func init() {
	fmt.Println("khoi tao matching engine...")
}
