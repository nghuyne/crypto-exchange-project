package controllers

import (
	"net/http"
	"strconv"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// GetAddresses returns all addresses for the logged-in user
func GetAddresses(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var addresses []models.Address
	if result := config.DB.Where("user_id = ?", userID).Find(&addresses); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Lỗi lấy danh sách địa chỉ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   addresses,
	})
}

// CreateAddress creates a new address for the logged-in user
func CreateAddress(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var req struct {
		Label      string `json:"label" binding:"required"`
		Address    string `json:"address" binding:"required"`
		Blockchain string `json:"blockchain" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Dữ liệu không hợp lệ"})
		return
	}

	address := models.Address{
		UserID:     userID,
		Label:      req.Label,
		Address:    req.Address,
		Blockchain: req.Blockchain,
	}

	if result := config.DB.Create(&address); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Lỗi tạo địa chỉ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   address,
	})
}

// DeleteAddress deletes an address by ID (only owner or admin can delete)
func DeleteAddress(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	addressID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "ID không hợp lệ"})
		return
	}

	// Check if address exists and belongs to user
	var address models.Address
	if result := config.DB.First(&address, addressID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Địa chỉ không tìm thấy"})
		return
	}

	// Check ownership
	if address.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Bạn không có quyền xóa địa chỉ này"})
		return
	}

	// Delete address
	if result := config.DB.Delete(&address); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Lỗi xóa địa chỉ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "Địa chỉ đã được xóa",
	})
}
