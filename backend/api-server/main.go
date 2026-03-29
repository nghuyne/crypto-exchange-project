package main

import (
	"fmt"
	"log"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/controllers" // Nhap code phan controllers
	"crypto-exchange-backend/models"

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
	r.POST("/api/v1/register", controllers.Register)
	r.POST("/api/v1/login", controllers.Login)

	// 4. Bat dau chay may chu
	fmt.Println("San sang don Request tai http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Loi may chu bi dong: %v", err)
	}
}
