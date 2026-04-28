package controllers

import (
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// GetWallet tra ve danh sach vi tien cua user dang dang nhap
func GetWallet(c *gin.Context) {
	// Lay user_id da duoc AuthRequired() luu vao context truoc do
	userID := c.MustGet("user_id").(uint)

	// Query database lay tat ca vi tien cua user nay
	var wallets []models.Wallet
	if result := config.DB.Where("user_id = ?", userID).Find(&wallets); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Loi lay du lieu vi tien!"})
		return
	}

	// Tra ve danh sach vi
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   wallets,
	})
}

// Deposit cho phep cong tien vao vi (chi danh cho Admin test)
func Deposit(c *gin.Context) {
	// Lay user_id cua nguoi dang goi request (tu JWT)
	userID := c.MustGet("user_id").(uint)

	// Dinh nghia du lieu can nhan tu body
	var input struct {
		Asset  string  `json:"asset" binding:"required"`  // Vi du: "USDT", "BTC"
		Amount float64 `json:"amount" binding:"required"` // So tien muon nap
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Thieu asset hoac amount!"})
		return
	}

	// Tim vi tuong ung cua user trong DB
	var wallet models.Wallet
	result := config.DB.Where("user_id = ? AND asset = ?", userID, input.Asset).First(&wallet)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Khong tim thay vi nay!"})
		return
	}

	// Cong them tien vao so du
	wallet.Balance += input.Amount
	config.DB.Save(&wallet)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Nap tien thanh cong!",
		"data":    wallet,
	})
}
