package config

import (
	"errors"
	"fmt"
	"time"

	"crypto-exchange-backend/blockchain"
	"crypto-exchange-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type demoSeedUser struct {
	Email    string
	Password string
	FullName string
	Wallets  []models.Wallet
}

type demoSeedOrder struct {
	Email         string
	Symbol        string
	Side          string
	Type          string
	Price         float64
	Quantity      float64
	Filled        float64
	Status        string
	CreatedOffset time.Duration
	Key           string
}

type demoSeedTrade struct {
	Symbol        string
	Price         float64
	Quantity      float64
	BuyRef        string
	SellRef       string
	CreatedOffset time.Duration
}

var demoSeedUsers = []demoSeedUser{
	{
		Email:    "alice.demo@cryptoex.com",
		Password: "123456",
		FullName: "Alice Nguyen",
		Wallets: []models.Wallet{
			{Asset: "USDT", Balance: 50000, LockedBalance: 0},
			{Asset: "BTC", Balance: 0.45, LockedBalance: 0.05},
			{Asset: "ETH", Balance: 8.2, LockedBalance: 0.3},
		},
	},
	{
		Email:    "bob.demo@cryptoex.com",
		Password: "123456",
		FullName: "Bob Tran",
		Wallets: []models.Wallet{
			{Asset: "USDT", Balance: 42000, LockedBalance: 1200},
			{Asset: "BTC", Balance: 0.18, LockedBalance: 0.02},
			{Asset: "SOL", Balance: 120, LockedBalance: 10},
		},
	},
	{
		Email:    "carol.demo@cryptoex.com",
		Password: "123456",
		FullName: "Carol Le",
		Wallets: []models.Wallet{
			{Asset: "USDT", Balance: 61000, LockedBalance: 2500},
			{Asset: "ETH", Balance: 14.7, LockedBalance: 1.1},
			{Asset: "TON", Balance: 1800, LockedBalance: 120},
		},
	},
}

var demoSeedOrders = []demoSeedOrder{
	{Email: "alice.demo@cryptoex.com", Symbol: "btc_usdt", Side: "BUY", Type: "LIMIT", Price: 67120.80, Quantity: 0.40, Filled: 0.40, Status: "FILLED", CreatedOffset: -23 * time.Hour, Key: "btc_buy"},
	{Email: "bob.demo@cryptoex.com", Symbol: "btc_usdt", Side: "SELL", Type: "LIMIT", Price: 68990.12, Quantity: 0.40, Filled: 0, Status: "OPEN", CreatedOffset: -2 * time.Hour, Key: "btc_sell"},
	{Email: "bob.demo@cryptoex.com", Symbol: "eth_usdt", Side: "BUY", Type: "LIMIT", Price: 3581.11, Quantity: 4.20, Filled: 2.10, Status: "PARTIAL", CreatedOffset: -20 * time.Hour, Key: "eth_buy"},
	{Email: "carol.demo@cryptoex.com", Symbol: "eth_usdt", Side: "SELL", Type: "LIMIT", Price: 3689.40, Quantity: 4.20, Filled: 0, Status: "OPEN", CreatedOffset: -19 * time.Hour, Key: "eth_sell"},
	{Email: "carol.demo@cryptoex.com", Symbol: "sol_usdt", Side: "BUY", Type: "LIMIT", Price: 181.10, Quantity: 65, Filled: 0, Status: "OPEN", CreatedOffset: -18 * time.Hour, Key: "sol_buy"},
	{Email: "alice.demo@cryptoex.com", Symbol: "sol_usdt", Side: "SELL", Type: "LIMIT", Price: 170.35, Quantity: 65, Filled: 65, Status: "FILLED", CreatedOffset: -18 * time.Hour, Key: "sol_sell"},
	{Email: "alice.demo@cryptoex.com", Symbol: "xrp_usdt", Side: "BUY", Type: "LIMIT", Price: 0.57, Quantity: 18000, Filled: 18000, Status: "FILLED", CreatedOffset: -17 * time.Hour, Key: "xrp_buy"},
	{Email: "bob.demo@cryptoex.com", Symbol: "xrp_usdt", Side: "SELL", Type: "LIMIT", Price: 0.59, Quantity: 18000, Filled: 0, Status: "OPEN", CreatedOffset: -16 * time.Hour, Key: "xrp_sell"},
	{Email: "bob.demo@cryptoex.com", Symbol: "ada_usdt", Side: "BUY", Type: "LIMIT", Price: 0.48, Quantity: 12000, Filled: 0, Status: "OPEN", CreatedOffset: -15 * time.Hour, Key: "ada_buy"},
	{Email: "carol.demo@cryptoex.com", Symbol: "ada_usdt", Side: "SELL", Type: "LIMIT", Price: 0.46, Quantity: 12000, Filled: 4500, Status: "PARTIAL", CreatedOffset: -14 * time.Hour, Key: "ada_sell"},
	{Email: "carol.demo@cryptoex.com", Symbol: "ton_usdt", Side: "BUY", Type: "LIMIT", Price: 6.18, Quantity: 1600, Filled: 0, Status: "OPEN", CreatedOffset: -13 * time.Hour, Key: "ton_buy"},
	{Email: "alice.demo@cryptoex.com", Symbol: "ton_usdt", Side: "SELL", Type: "LIMIT", Price: 6.51, Quantity: 1600, Filled: 1600, Status: "FILLED", CreatedOffset: -12 * time.Hour, Key: "ton_sell"},
}

var demoSeedTrades = []demoSeedTrade{
	{Symbol: "btc_usdt", Price: 67120.80, Quantity: 0.18, BuyRef: "btc_buy", SellRef: "btc_sell", CreatedOffset: -23 * time.Hour},
	{Symbol: "btc_usdt", Price: 68450.25, Quantity: 0.22, BuyRef: "btc_buy", SellRef: "btc_sell", CreatedOffset: -2 * time.Hour},
	{Symbol: "eth_usdt", Price: 3581.11, Quantity: 1.80, BuyRef: "eth_buy", SellRef: "eth_sell", CreatedOffset: -20 * time.Hour},
	{Symbol: "eth_usdt", Price: 3658.73, Quantity: 2.40, BuyRef: "eth_buy", SellRef: "eth_sell", CreatedOffset: -1 * time.Hour},
	{Symbol: "sol_usdt", Price: 181.10, Quantity: 45, BuyRef: "sol_buy", SellRef: "sol_sell", CreatedOffset: -19 * time.Hour},
	{Symbol: "sol_usdt", Price: 172.46, Quantity: 20, BuyRef: "sol_buy", SellRef: "sol_sell", CreatedOffset: -3 * time.Hour},
	{Symbol: "xrp_usdt", Price: 0.57, Quantity: 12000, BuyRef: "xrp_buy", SellRef: "xrp_sell", CreatedOffset: -18 * time.Hour},
	{Symbol: "xrp_usdt", Price: 0.58, Quantity: 6000, BuyRef: "xrp_buy", SellRef: "xrp_sell", CreatedOffset: -1 * time.Hour},
	{Symbol: "ada_usdt", Price: 0.48, Quantity: 7000, BuyRef: "ada_buy", SellRef: "ada_sell", CreatedOffset: -17 * time.Hour},
	{Symbol: "ada_usdt", Price: 0.46, Quantity: 5000, BuyRef: "ada_buy", SellRef: "ada_sell", CreatedOffset: -4 * time.Hour},
	{Symbol: "ton_usdt", Price: 6.18, Quantity: 900, BuyRef: "ton_buy", SellRef: "ton_sell", CreatedOffset: -16 * time.Hour},
	{Symbol: "ton_usdt", Price: 6.44, Quantity: 700, BuyRef: "ton_buy", SellRef: "ton_sell", CreatedOffset: -1 * time.Hour},
}

// SeedInitialData len du lieu khoi dau de trang Data Overview co so lieu thuc.
func SeedInitialData() error {
	if DB == nil {
		return errors.New("database is not ready")
	}

	if err := seedDemoAccounts(); err != nil {
		return err
	}

	var orderCount int64
	if err := DB.Model(&models.Order{}).Count(&orderCount).Error; err != nil {
		return err
	}

	var tradeCount int64
	if err := DB.Model(&models.Trade{}).Count(&tradeCount).Error; err != nil {
		return err
	}

	if orderCount == 0 && tradeCount == 0 {
		if err := seedDemoOrdersAndTrades(); err != nil {
			return err
		}
	}

	if err := seedDemoAuditTrail(); err != nil {
		return err
	}

	return nil
}

func seedDemoAccounts() error {
	return DB.Transaction(func(tx *gorm.DB) error {
		for _, seedUser := range demoSeedUsers {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(seedUser.Password), bcrypt.DefaultCost)
			if err != nil {
				return err
			}

			user := models.User{}
			if err := tx.Where("email = ?", seedUser.Email).
				Attrs(models.User{Email: seedUser.Email, Password: string(hashedPassword), FullName: seedUser.FullName}).
				FirstOrCreate(&user).Error; err != nil {
				return err
			}

			for _, walletSeed := range seedUser.Wallets {
				wallet := models.Wallet{}
				if err := tx.Where("user_id = ? AND asset = ?", user.ID, walletSeed.Asset).
					Assign(models.Wallet{Balance: walletSeed.Balance, LockedBalance: walletSeed.LockedBalance}).
					FirstOrCreate(&wallet, models.Wallet{UserID: user.ID, Asset: walletSeed.Asset}).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func seedDemoOrdersAndTrades() error {
	return DB.Transaction(func(tx *gorm.DB) error {
		userMap := make(map[string]models.User)
		for _, seedUser := range demoSeedUsers {
			var user models.User
			if err := tx.Where("email = ?", seedUser.Email).First(&user).Error; err != nil {
				return err
			}
			userMap[seedUser.Email] = user
		}

		orderMap := make(map[string]models.Order)
		now := time.Now()
		for _, seedOrder := range demoSeedOrders {
			user, ok := userMap[seedOrder.Email]
			if !ok {
				return fmt.Errorf("missing demo user for order seed: %s", seedOrder.Email)
			}

			order := models.Order{
				UserID:   user.ID,
				Symbol:   seedOrder.Symbol,
				Side:     seedOrder.Side,
				Type:     seedOrder.Type,
				Price:    seedOrder.Price,
				Quantity: seedOrder.Quantity,
				Filled:   seedOrder.Filled,
				Status:   seedOrder.Status,
			}
			if err := tx.Create(&order).Error; err != nil {
				return err
			}
			if err := tx.Model(&models.Order{}).Where("id = ?", order.ID).Update("created_at", now.Add(seedOrder.CreatedOffset)).Error; err != nil {
				return err
			}
			orderMap[seedOrder.Key] = order
		}

		for _, seedTrade := range demoSeedTrades {
			buyOrder, ok := orderMap[seedTrade.BuyRef]
			if !ok {
				return fmt.Errorf("missing buy ref for trade seed: %s", seedTrade.BuyRef)
			}
			sellOrder, ok := orderMap[seedTrade.SellRef]
			if !ok {
				return fmt.Errorf("missing sell ref for trade seed: %s", seedTrade.SellRef)
			}

			trade := models.Trade{
				BuyOrderID:  buyOrder.ID,
				SellOrderID: sellOrder.ID,
				Symbol:      seedTrade.Symbol,
				Price:       seedTrade.Price,
				Quantity:    seedTrade.Quantity,
			}
			if err := tx.Create(&trade).Error; err != nil {
				return err
			}
			if err := tx.Model(&models.Trade{}).Where("id = ?", trade.ID).Update("created_at", now.Add(seedTrade.CreatedOffset)).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func seedDemoAuditTrail() error {
	if AuditChain == nil {
		return nil
	}

	if len(AuditChain.Blocks) > 1 {
		return nil
	}

	audits := []string{
		`{"event":"ORDER_ACCEPTED","order_id":1,"user_id":1,"symbol":"btc_usdt","amount":0.40,"risk_score":32}`,
		`{"event":"ORDER_BLOCKED","order_id":4,"user_id":3,"symbol":"sol_usdt","amount":65,"risk_score":78}`,
		`{"event":"ORDER_MATCHED","order_id":7,"user_id":2,"symbol":"eth_usdt","amount":2.40,"risk_score":44}`,
	}

	for _, audit := range audits {
		if err := AuditChain.AddAuditRecord(audit); err != nil {
			return err
		}
	}

	return nil
}

// EnsureAuditChainInitialized giup goi lai khi can trong tests hoac scripts.
func EnsureAuditChainInitialized() *blockchain.Blockchain {
	if AuditChain == nil {
		AuditChain = blockchain.NewBlockchain()
	}
	return AuditChain
}
