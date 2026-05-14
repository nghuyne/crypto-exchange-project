package controllers

import (
	"fmt"
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

func maskUserID(id uint) string {
	return fmt.Sprintf("U***%02d", id%100)
}

// getorderbook tra ve danh sach cac lenh mua va ban dang cho khop
func GetOrderBook(c *gin.Context) {
	symbol := c.Query("symbol")
	if symbol == "" {
		symbol = "btc_usdt" // mac dinh la btc_usdt neu khong co query param
	}

	// lay 20 lenh mua gia cao nhat (asks dang cho)
	var buyorders []models.Order
	config.DB.Where("symbol = ? AND side = ? AND status IN (?, ?)", symbol, "BUY", "OPEN", "PARTIAL").
		Order("price desc").Limit(20).Find(&buyorders)

	// lay 20 lenh ban gia thap nhat (bids dang cho)
	var sellorders []models.Order
	config.DB.Where("symbol = ? AND side = ? AND status IN (?, ?)", symbol, "SELL", "OPEN", "PARTIAL").
		Order("price asc").Limit(20).Find(&sellorders)

	// gom nhom du lieu de tra ve cho frontend
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"bids": buyorders,
			"asks": sellorders,
		},
	})
}

// gettrades tra ve lich su 50 giao dich moi nhat cua thi truong
func GetTrades(c *gin.Context) {
	symbol := c.Query("symbol")
	if symbol == "" {
		symbol = "btc_usdt"
	}

	var trades []models.Trade
	config.DB.Where("symbol = ?", symbol).Order("created_at desc").Limit(50).Find(&trades)

	if len(trades) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   []gin.H{},
		})
		return
	}

	orderIDs := make([]uint, 0, len(trades)*2)
	for _, t := range trades {
		orderIDs = append(orderIDs, t.BuyOrderID, t.SellOrderID)
	}

	var orders []models.Order
	config.DB.Where("id IN ?", orderIDs).Find(&orders)
	orderMap := make(map[uint]models.Order, len(orders))
	for _, o := range orders {
		orderMap[o.ID] = o
	}

	response := make([]gin.H, 0, len(trades))
	for _, t := range trades {
		buyOrder := orderMap[t.BuyOrderID]
		sellOrder := orderMap[t.SellOrderID]

		makerSide := "UNKNOWN"
		takerSide := "UNKNOWN"
		makerMasked := "U***--"
		takerMasked := "U***--"

		if buyOrder.ID != 0 && sellOrder.ID != 0 {
			if buyOrder.CreatedAt.Before(sellOrder.CreatedAt) {
				makerSide = "BUY"
				takerSide = "SELL"
				makerMasked = maskUserID(buyOrder.UserID)
				takerMasked = maskUserID(sellOrder.UserID)
			} else {
				makerSide = "SELL"
				takerSide = "BUY"
				makerMasked = maskUserID(sellOrder.UserID)
				takerMasked = maskUserID(buyOrder.UserID)
			}
		}

		response = append(response, gin.H{
			"id":               t.ID,
			"symbol":           t.Symbol,
			"price":            t.Price,
			"quantity":         t.Quantity,
			"created_at":       t.CreatedAt,
			"buy_order_id":     t.BuyOrderID,
			"sell_order_id":    t.SellOrderID,
			"buy_user_masked":  maskUserID(buyOrder.UserID),
			"sell_user_masked": maskUserID(sellOrder.UserID),
			"maker_side":       makerSide,
			"taker_side":       takerSide,
			"maker_user_masked": makerMasked,
			"taker_user_masked": takerMasked,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   response,
	})
}

// GetUserTrades returns trade history of the logged-in user
func GetUserTrades(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	limit := 10

	// Query all trades where user is buyer (buy_order_id belongs to user)
	var tradesBuy []models.Trade
	config.DB.Table("trades t").
		Joins("INNER JOIN orders buy_order ON t.buy_order_id = buy_order.id").
		Where("buy_order.user_id = ?", userID).
		Order("t.created_at desc").
		Limit(limit).
		Scan(&tradesBuy)

	// Query all trades where user is seller (sell_order_id belongs to user)
	var tradesSell []models.Trade
	config.DB.Table("trades t").
		Joins("INNER JOIN orders sell_order ON t.sell_order_id = sell_order.id").
		Where("sell_order.user_id = ?", userID).
		Order("t.created_at desc").
		Limit(limit).
		Scan(&tradesSell)

	// Merge and sort by created_at desc, then take latest `limit`
	allTrades := append(tradesBuy, tradesSell...)
	// Simple sort by CreatedAt desc (this should be sorted by DB query ideally)
	for i := 0; i < len(allTrades); i++ {
		for j := i + 1; j < len(allTrades); j++ {
			if allTrades[i].CreatedAt.Before(allTrades[j].CreatedAt) {
				allTrades[i], allTrades[j] = allTrades[j], allTrades[i]
			}
		}
	}
	if len(allTrades) > limit {
		allTrades = allTrades[:limit]
	}

	// Fetch associated orders to determine side for current user
	orderIDs := make([]uint, 0, len(allTrades)*2)
	for _, t := range allTrades {
		orderIDs = append(orderIDs, t.BuyOrderID, t.SellOrderID)
	}

	var orders []models.Order
	config.DB.Where("id IN ?", orderIDs).Find(&orders)
	orderMap := make(map[uint]models.Order, len(orders))
	for _, o := range orders {
		orderMap[o.ID] = o
	}

	response := make([]gin.H, 0, len(allTrades))
	for _, t := range allTrades {
		buyOrder := orderMap[t.BuyOrderID]
		sellOrder := orderMap[t.SellOrderID]

		// Determine if current user is buyer or seller
		userSide := "UNKNOWN"
		counterparty := "U***--"

		if buyOrder.UserID == userID {
			userSide = "BUY"
			counterparty = maskUserID(sellOrder.UserID)
		} else if sellOrder.UserID == userID {
			userSide = "SELL"
			counterparty = maskUserID(buyOrder.UserID)
		}

		response = append(response, gin.H{
			"id":            t.ID,
			"symbol":        t.Symbol,
			"price":         t.Price,
			"quantity":      t.Quantity,
			"created_at":    t.CreatedAt,
			"user_side":     userSide,
			"counterparty":  counterparty,
			"buy_order_id":  t.BuyOrderID,
			"sell_order_id": t.SellOrderID,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   response,
	})
}
