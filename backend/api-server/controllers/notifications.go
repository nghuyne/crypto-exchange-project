package controllers

import (
	"net/http"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// GetNotifications trả về danh sách thông báo của người dùng hiện tại
// GET /api/v1/notifications
func GetNotifications(c *gin.Context) {
	// Lấy user ID từ JWT token (đã được set bởi AuthRequired middleware)
	userID, _ := c.Get("user_id")
	userIDVal := userID.(uint)

	var notifications []models.Notification
	result := config.DB.
		Where("user_id = ?", userIDVal).
		Order("created_at DESC").
		Limit(20).
		Find(&notifications)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"data":   []models.Notification{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   notifications,
	})
}

// GetNotificationCount trả về số thông báo chưa đọc
// GET /api/v1/notifications/count
func GetNotificationCount(c *gin.Context) {
	// Lấy user ID từ JWT token
	userID, _ := c.Get("user_id")
	userIDVal := userID.(uint)

	var unreadCount int64
	config.DB.
		Model(&models.Notification{}).
		Where("user_id = ? AND read = ?", userIDVal, false).
		Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"count": unreadCount,
		},
	})
}

// MarkNotificationAsRead đánh dấu thông báo là đã đọc
// PUT /api/v1/notifications/:id/read
func MarkNotificationAsRead(c *gin.Context) {
	notificationID := c.Param("id")

	// Lấy user ID từ JWT token
	userID, _ := c.Get("user_id")
	userIDVal := userID.(uint)

	// Cập nhật thông báo nếu thuộc về user hiện tại
	result := config.DB.
		Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userIDVal).
		Update("read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Không thể cập nhật thông báo",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Thông báo không tồn tại",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Thông báo đã được đánh dấu là đã đọc",
	})
}
