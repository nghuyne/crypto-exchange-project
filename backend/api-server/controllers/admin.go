package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// GetAdminDashboard returns dashboard statistics
func GetAdminDashboard(c *gin.Context) {


	var userCount int64
	var activeUserCount int64
	var orderCount int64
	var tradeCount int64
	var totalVolume float64

	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Model(&models.User{}).Where("status = ?", "ACTIVE").Count(&activeUserCount)
	config.DB.Model(&models.Order{}).Count(&orderCount)
	config.DB.Model(&models.Trade{}).Count(&tradeCount)

	var trades []models.Trade
	config.DB.Find(&trades)
	for _, trade := range trades {
		totalVolume += trade.Price * trade.Quantity
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_users":      userCount,
			"active_users":     activeUserCount,
			"total_orders":     orderCount,
			"total_trades":     tradeCount,
			"total_volume":     totalVolume,
			"suspended_count":  userCount - activeUserCount,
		},
	})
}

// GetAllUsers returns list of all users with filtering
func GetAllUsers(c *gin.Context) {
	status := c.Query("status")    // ACTIVE, SUSPENDED, BANNED
	role := c.Query("role")        // USER, ADMIN
	kyc := c.Query("kyc_status")   // PENDING, VERIFIED, REJECTED
	search := c.Query("search")    // email or full_name
	page := c.DefaultQuery("page", "1")

	pageNum, _ := strconv.Atoi(page)
	limit := 20
	offset := (pageNum - 1) * limit

	query := config.DB

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}
	if kyc != "" {
		query = query.Where("kyc_status = ?", kyc)
	}
	if search != "" {
		query = query.Where("email LIKE ? OR full_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var users []models.User
	var total int64

	query.Model(&models.User{}).Count(&total)
	query.Offset(offset).Limit(limit).Find(&users)

	// Hide password
	for i := range users {
		users[i].Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"users": users,
			"total": total,
			"page":  pageNum,
		},
	})
}

// SuspendUser suspends a user account
func SuspendUser(c *gin.Context) {
	adminID := c.MustGet("user_id").(uint)

	var req struct {
		UserID uint   `json:"user_id" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid request"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		return
	}

	// Update user status
	if err := config.DB.Model(&user).Update("status", "SUSPENDED").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to suspend user"})
		return
	}

	// Log action
	logDetails := fmt.Sprintf(`{"reason":"%s"}`, req.Reason)
	LogAdminAction(adminID, "SUSPEND_USER", req.UserID, logDetails)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("User %d suspended", req.UserID),
	})
}

// ResumeUser resumes a suspended user account
func ResumeUser(c *gin.Context) {
	adminID := c.MustGet("user_id").(uint)

	var req struct {
		UserID uint `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid request"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		return
	}

	// Update user status
	if err := config.DB.Model(&user).Update("status", "ACTIVE").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to resume user"})
		return
	}

	// Log action
	LogAdminAction(adminID, "RESUME_USER", req.UserID, "")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("User %d resumed", req.UserID),
	})
}

// VerifyUserKYC marks user as KYC verified
func VerifyUserKYC(c *gin.Context) {
	adminID := c.MustGet("user_id").(uint)

	var req struct {
		UserID uint   `json:"user_id" binding:"required"`
		Status string `json:"status" binding:"required"` // VERIFIED, REJECTED
		Notes  string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid request"})
		return
	}

	if req.Status != "VERIFIED" && req.Status != "REJECTED" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid KYC status"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		return
	}

	// Update KYC status
	if err := config.DB.Model(&user).Update("kyc_status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update KYC status"})
		return
	}

	// Log action
	logDetails := fmt.Sprintf(`{"notes":"%s"}`, req.Notes)
	LogAdminAction(adminID, "VERIFY_KYC", req.UserID, logDetails)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("User KYC status updated to %s", req.Status),
	})
}

// GetAllOrders returns all orders with filtering
func GetAllOrders(c *gin.Context) {
	status := c.Query("status")   // OPEN, FILLED, PARTIAL, CANCELLED
	symbol := c.Query("symbol")
	page := c.DefaultQuery("page", "1")

	pageNum, _ := strconv.Atoi(page)
	limit := 50
	offset := (pageNum - 1) * limit

	query := config.DB

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if symbol != "" {
		query = query.Where("symbol = ?", symbol)
	}

	var orders []models.Order
	var total int64

	query.Model(&models.Order{}).Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&orders)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"orders": orders,
			"total":  total,
			"page":   pageNum,
		},
	})
}

// CancelOrderAdmin force cancels an order (admin)
func CancelOrderAdmin(c *gin.Context) {
	adminID := c.MustGet("user_id").(uint)

	var req struct {
		OrderID uint   `json:"order_id" binding:"required"`
		Reason  string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid request"})
		return
	}

	var order models.Order
	if err := config.DB.First(&order, req.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Order not found"})
		return
	}

	// Cancel order
	tx := config.DB.Begin()

	if err := tx.Model(&order).Update("status", "CANCELLED").Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to cancel order"})
		return
	}

	// Unlock wallet balance
	var wallet models.Wallet
	if order.Side == "BUY" {
		// Unlock USDT for buy order
		tx.Where("user_id = ? AND asset = ?", order.UserID, "USDT").First(&wallet)
	} else {
		// Unlock base asset for sell order
		baseasset := string(order.Symbol[0:3])
		tx.Where("user_id = ? AND asset = ?", order.UserID, baseasset).First(&wallet)
	}

	var amountToUnlock float64
	if order.Side == "BUY" {
		amountToUnlock = order.Price * order.Quantity
	} else {
		amountToUnlock = order.Quantity
	}

	wallet.LockedBalance -= amountToUnlock
	wallet.Balance += amountToUnlock
	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to unlock wallet"})
		return
	}

	tx.Commit()

	// Log action
	logDetails := fmt.Sprintf(`{"reason":"%s"}`, req.Reason)
	LogAdminAction(adminID, "CANCEL_ORDER", req.OrderID, logDetails)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Order %d cancelled", req.OrderID),
	})
}

// GetSystemConfig gets current system configuration
func GetSystemConfig(c *gin.Context) {
	var configs []models.SystemConfig
	config.DB.Find(&configs)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   configs,
	})
}

// UpdateSystemConfig updates system configuration (fee, limits, etc)
func UpdateSystemConfig(c *gin.Context) {
	adminID := c.MustGet("user_id").(uint)

	var req struct {
		ConfigKey string `json:"config_key" binding:"required"`
		Value     string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid request"})
		return
	}

	var sysConfig models.SystemConfig
	result := config.DB.Where("config_key = ?", req.ConfigKey).First(&sysConfig)

	if result.Error != nil {
		// Create new config
		sysConfig = models.SystemConfig{
			ConfigKey: req.ConfigKey,
			Value:     req.Value,
			UpdatedBy: adminID,
		}
		if err := config.DB.Create(&sysConfig).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to create config"})
			return
		}
	} else {
		// Update existing config
		if err := config.DB.Model(&sysConfig).Updates(map[string]interface{}{
			"value":      req.Value,
			"updated_by": adminID,
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update config"})
			return
		}
	}

	// Log action
	logDetails := fmt.Sprintf(`{"old_value":"","new_value":"%s"}`, req.Value)
	LogAdminAction(adminID, "UPDATE_CONFIG", 0, logDetails)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Config %s updated to %s", req.ConfigKey, req.Value),
	})
}

// GetAdminLogs returns admin action logs
func GetAdminLogs(c *gin.Context) {
	adminID := c.Query("admin_id")
	action := c.Query("action")
	page := c.DefaultQuery("page", "1")

	pageNum, _ := strconv.Atoi(page)
	limit := 50
	offset := (pageNum - 1) * limit

	query := config.DB

	if adminID != "" {
		adminIDNum, _ := strconv.ParseUint(adminID, 10, 32)
		query = query.Where("admin_id = ?", adminIDNum)
	}
	if action != "" {
		query = query.Where("action = ?", action)
	}

	var logs []models.AdminLog
	var total int64

	query.Model(&models.AdminLog{}).Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&logs)

	// Fetch admin names
	adminIDs := make([]uint, 0)
	for _, log := range logs {
		adminIDs = append(adminIDs, log.AdminID)
	}

	var admins []models.User
	config.DB.Where("id IN ?", adminIDs).Find(&admins)
	adminMap := make(map[uint]string)
	for _, admin := range admins {
		adminMap[admin.ID] = admin.FullName
	}

	// Build response with admin names
	response := make([]gin.H, len(logs))
	for i, log := range logs {
		var details map[string]interface{}
		json.Unmarshal([]byte(log.Details), &details)

		response[i] = gin.H{
			"id":          log.ID,
			"admin_id":    log.AdminID,
			"admin_name":  adminMap[log.AdminID],
			"action":      log.Action,
			"target_id":   log.TargetID,
			"details":     details,
			"created_at":  log.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"logs":  response,
			"total": total,
			"page":  pageNum,
		},
	})
}
