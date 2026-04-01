package controllers

import (
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

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

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   trades,
	})
}
