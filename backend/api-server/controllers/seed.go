package controllers

import (
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// ReseedData is a debug endpoint to reseed demo data for testing
// DEVELOPMENT ONLY - should be disabled in production
func ReseedData(c *gin.Context) {
	// Check if this is dev mode (you could add env check here)
	// For now, always allow for testing purposes

	// Clear existing data (optional - only if user wants fresh state)
	shouldClear := c.Query("clear") == "true"

	if shouldClear {
		config.DB.Exec("DELETE FROM trades")
		config.DB.Exec("DELETE FROM orders")
	}

	// Re-run seed
	if err := config.SeedInitialData(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to reseed data",
			"error":   err.Error(),
		})
		return
	}

	// Get stats
	var orderCount int64
	var tradeCount int64
	var userCount int64

	config.DB.Model(&models.Order{}).Count(&orderCount)
	config.DB.Model(&models.Trade{}).Count(&tradeCount)
	config.DB.Model(&models.User{}).Count(&userCount)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Demo data reseeded successfully",
		"data": gin.H{
			"users":  userCount,
			"orders": orderCount,
			"trades": tradeCount,
		},
	})
}

// GetDataStats returns current data statistics
func GetDataStats(c *gin.Context) {
	var orderCount int64
	var tradeCount int64
	var userCount int64
	var walletCount int64

	config.DB.Model(&models.Order{}).Count(&orderCount)
	config.DB.Model(&models.Trade{}).Count(&tradeCount)
	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Model(&models.Wallet{}).Count(&walletCount)

	// Get sample trades to verify they exist
	var trades []models.Trade
	config.DB.Order("created_at DESC").Limit(5).Find(&trades)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"users":   userCount,
			"orders":  orderCount,
			"trades":  tradeCount,
			"wallets": walletCount,
			"sample_trades": trades,
		},
	})
}
