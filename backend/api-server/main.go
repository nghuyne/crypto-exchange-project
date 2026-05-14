package main

import (
	"fmt"
	"log"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/controllers" // Nhap code phan controllers
	"crypto-exchange-backend/models"
	"crypto-exchange-backend/ws" // nhap package websocket

	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Dang khoi dong May Chu CryptoEX Core...")

	// 1. Khoi tao ket noi Database va Redis
	config.ConnectDB()
	config.ConnectRedis()

	// 2. Khoi tao AI Risk Engine va Blockchain Audit Trail
	// - Phai chay SAU ConnectDB/ConnectRedis vi sau nay audit record se ghi xuong
	// - Phai chay TRUOC khi router nhan request de tranh nil pointer panic
	// - InitAIBlockchain khoi dong cleanup goroutine ben trong RiskEvaluator
	config.InitAIBlockchain()

	// 3. Dong bo hoa bang
<<<<<<< HEAD
<<<<<<< HEAD
	err := config.DB.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Order{}, &models.Trade{}, &models.Notification{}, &models.AdminLog{}, &models.SystemConfig{}, &models.Address{})
=======
<<<<<<< HEAD
	err := config.DB.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Order{}, &models.Trade{}, &models.Notification{})
=======
	err := config.DB.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Order{}, &models.Trade{}, &models.AdminLog{}, &models.SystemConfig{})
>>>>>>> 6e458ee (feat: implement admin API, faucet feature, user profile display, and project documentation)
>>>>>>> d025493 (feat: implement admin API, faucet feature, user profile display, and project documentation)
=======
	err := config.DB.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Order{}, &models.Trade{}, &models.Notification{}, &models.AdminLog{}, &models.SystemConfig{}, &models.Address{})
>>>>>>> f2b61cc (feat: add Address model and endpoints with fallback to mock data)
	if err != nil {
		log.Printf("Loi ky thuat tao bang: %v", err)
	}

	if err := config.SeedInitialData(); err != nil {
		log.Printf("Loi seed du lieu ban dau: %v", err)
	}

	// 4. Khoi tao router cua Gin
	r := gin.Default()

	r.GET("/api/v1/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "success", "message": "Trai tim Backend da dap!"})
	})

	// Route cong khai - khong can dang nhap
	r.POST("/api/v1/register", controllers.Register)
	r.POST("/api/v1/login", controllers.Login)

	// Thong tin thi truong - khong can dang nhap
	r.GET("/api/v1/market/orderbook", controllers.GetOrderBook)
	r.GET("/api/v1/market/trades", controllers.GetTrades)

	// DATA MODULE — Aggregation layer cho DataScreen
	// Public vi day la thong tin tong quan san, tuong tu trang Markets tren Binance
	r.GET("/api/v1/data/overview", controllers.GetDataOverview)
	r.GET("/api/v1/data/coins", controllers.GetDataCoins)
	r.GET("/api/v1/data/heatmap", controllers.GetDataHeatmap)
	r.GET("/api/v1/data/sentiment", controllers.GetDataSentiment)

	// BLOCKCHAIN AUDIT — Public vi audit trail phai minh bach de verify
	r.GET("/api/v1/blockchain/blocks", controllers.GetBlockchainBlocks)

	// DEBUG ENDPOINTS — for development/testing only
	r.GET("/api/v1/debug/stats", controllers.GetDataStats)
	r.POST("/api/v1/debug/reseed", controllers.ReseedData)

	// WebSocket cong khai
	r.GET("/ws", func(c *gin.Context) {
		ws.HandleWebSocket(c.Writer, c.Request)
	})

	// Route yeu cau dang nhap - boc trong AuthRequired middleware
	auth := r.Group("/api/v1")
	auth.Use(controllers.AuthRequired())
	{
		auth.GET("/me", controllers.GetMe)
		auth.GET("/wallet", controllers.GetWallet)
		auth.GET("/wallet/user-trades", controllers.GetUserTrades)
		auth.GET("/wallet/risk-assessment", controllers.GetRiskAssessment)
		auth.POST("/deposit", controllers.Deposit)
		auth.POST("/faucet", controllers.Faucet)

		// Quan ly lenh (orders)
		auth.POST("/orders", controllers.CreateOrder)
		auth.GET("/orders", controllers.GetOrders)
		auth.DELETE("/orders/:id", controllers.CancelOrder)

		// Notifications
		auth.GET("/notifications", controllers.GetNotifications)
		auth.GET("/notifications/count", controllers.GetNotificationCount)
		auth.PUT("/notifications/:id/read", controllers.MarkNotificationAsRead)

		// Addresses
		auth.GET("/addresses", controllers.GetAddresses)
		auth.POST("/addresses", controllers.CreateAddress)
		auth.DELETE("/addresses/:id", controllers.DeleteAddress)
	}

	// ADMIN ROUTES — Yeu cau quyen admin (token + role check)
	admin := r.Group("/api/v1/admin")
	admin.Use(controllers.AuthRequired()).Use(controllers.AdminRequired())
	{
		// Dashboard
		admin.GET("/dashboard", controllers.GetAdminDashboard)

		// User management
		admin.GET("/users", controllers.GetAllUsers)
		admin.POST("/users/suspend", controllers.SuspendUser)
		admin.POST("/users/resume", controllers.ResumeUser)
		admin.POST("/users/verify-kyc", controllers.VerifyUserKYC)

		// Order management
		admin.GET("/orders", controllers.GetAllOrders)
		admin.POST("/orders/cancel", controllers.CancelOrderAdmin)

		// System configuration
		admin.GET("/config", controllers.GetSystemConfig)
		admin.POST("/config/update", controllers.UpdateSystemConfig)

		// Admin logs
		admin.GET("/logs", controllers.GetAdminLogs)
	}

	// 5. Bat dau chay may chu
	fmt.Println("San sang don Request tai http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Loi may chu bi dong: %v", err)
	}
}
