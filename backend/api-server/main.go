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

	// 2. Dong bo hoa bang
	err := config.DB.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Order{})
	if err != nil {
		log.Printf("Loi ky thuat tao bang: %v", err)
	}

	// 3. Khoi tao router cua Gin
	r := gin.Default()

	r.GET("/api/v1/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "success", "message": "Trai tim Backend da dap!"})
	})

	// Phan route cua Dang Ky va Dang Nhap nam o day
	// Route cong khai - khong can dang nhap
	r.POST("/api/v1/register", controllers.Register)
	r.POST("/api/v1/login", controllers.Login)

	// thong tin thi truong - khong can dang nhap
	r.GET("/api/v1/market/orderbook", controllers.GetOrderBook)
	r.GET("/api/v1/market/trades", controllers.GetTrades)

	// websocket cong khai
	r.GET("/ws", func(c *gin.Context) {
		ws.HandleWebSocket(c.Writer, c.Request)
	})

	// Route yeu cau dang nhap - boc trong AuthRequired middleware
	auth := r.Group("/api/v1")
	auth.Use(controllers.AuthRequired())
	{
		auth.GET("/wallet", controllers.GetWallet)
		auth.POST("/deposit", controllers.Deposit)

		// quan ly lenh (orders)
		auth.POST("/orders", controllers.CreateOrder)
		auth.GET("/orders", controllers.GetOrders)
		auth.DELETE("/orders/:id", controllers.CancelOrder)
	}

	// 4. Bat dau chay may chu
	fmt.Println("San sang don Request tai http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Loi may chu bi dong: %v", err)
	}
}
