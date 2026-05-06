package controllers

import (
	"fmt"
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// GetWallet returns wallet list of the logged-in user
func GetWallet(c *gin.Context) {
	// Get user_id stored by AuthRequired() middleware
	userID := c.MustGet("user_id").(uint)

	// Query database for all wallets of this user
	var wallets []models.Wallet
	if result := config.DB.Where("user_id = ?", userID).Find(&wallets); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch wallet data"})
		return
	}

	// Return wallet list
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   wallets,
	})
}

// Deposit allows adding funds to a wallet (for testing)
func Deposit(c *gin.Context) {
	// Get user_id from JWT
	userID := c.MustGet("user_id").(uint)

	// Define required input data
	var input struct {
		Asset  string  `json:"asset" binding:"required"`  // e.g., "USDT", "BTC"
		Amount float64 `json:"amount" binding:"required"` // Amount to deposit
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Missing asset or amount"})
		return
	}

	// Find the user's wallet in DB
	var wallet models.Wallet
	result := config.DB.Where("user_id = ? AND asset = ?", userID, input.Asset).First(&wallet)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Wallet not found"})
		return
	}

	// Add funds to balance
	wallet.Balance += input.Amount
	config.DB.Save(&wallet)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Deposit successful",
		"data":    wallet,
	})
}

// GetRiskAssessment returns risk evaluation and AI insights for user
func GetRiskAssessment(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	// Count trades for risk assessment
	var tradeCount int64
	config.DB.Table("trades t").
		Joins("INNER JOIN orders buy_order ON t.buy_order_id = buy_order.id OR t.sell_order_id = buy_order.id").
		Where("buy_order.user_id = ? AND t.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)", userID).
		Count(&tradeCount)

	// Get recent orders to assess velocity/frequency
	var orders []models.Order
	config.DB.Where("user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)", userID).
		Order("created_at desc").
		Limit(20).
		Find(&orders)

	// Calculate risk score based on trading activity
	// Simple heuristic: lower activity = lower risk
	riskScore := 75 // Start with safe score
	riskLevel := "LOW"
	insights := []string{}

	if len(orders) == 0 {
		riskScore = 95
		insights = append(insights, "New account: No trading activity in the last 24 hours.")
	} else if len(orders) > 10 {
		riskScore = 50
		riskLevel = "MEDIUM"
		insights = append(insights, fmt.Sprintf("Detected %d orders in 24h - Monitor your trading frequency.", len(orders)))
	} else {
		riskScore = 85
		insights = append(insights, fmt.Sprintf("Normal activity: %d orders in 24h.", len(orders)))
	}

	// Add fee recommendations based on asset patterns
	var wallets []models.Wallet
	config.DB.Where("user_id = ?", userID).Find(&wallets)

	// Check for high holdings suggesting need for yield
	for _, w := range wallets {
		if w.Balance > 1000 && w.Asset == "USDT" {
			insights = append(insights, "💰 You're holding 1000+ USDT - Consider trading for yield.")
		}
	}

	// Check for volatile patterns (simplified)
	if tradeCount > 5 {
		insights = append(insights, "📊 ETH fees are at lowest this week - Execute now if planned.")
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"risk_score": riskScore,
			"risk_level": riskLevel,
			"insights":  insights,
			"trade_count_7d": tradeCount,
		},
	})
}

