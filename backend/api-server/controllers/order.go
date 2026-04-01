package controllers

import (
	"net/http"
	"strings"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/engine" // nhap engine cho phep khop lenh
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// createorder dung de tao lenh mua hoac ban
func CreateOrder(c *gin.Context) {
	// lay id nguoi dung tu jwt da duoc middleware xac thuc
	userid := c.MustGet("user_id").(uint)

	// cau truc du lieu nhan tu frontend
	var input struct {
		Symbol   string  `json:"symbol" binding:"required"`   // vd: "btc_usdt"
		Side     string  `json:"side" binding:"required"`     // "buy" hoac "sell"
		Type     string  `json:"type" binding:"required"`     // "limit" hoac "market"
		Price    float64 `json:"price" binding:"required"`    // gia dat lenh
		Quantity float64 `json:"quantity" binding:"required"` // so luong muon mua/ban
	}

	// kiem tra du lieu dau vao
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "du lieu khong hop le"})
		return
	}

	// chuan hoa du lieu (viet hoa side va type de de so sanh)
	input.Side = strings.ToUpper(input.Side)
	input.Type = strings.ToUpper(input.Type)
	input.Symbol = strings.ToLower(input.Symbol)

	// xac dinh loai tai san can khoa (funding)
	// neu mua btc_usdt thi khoa usdt
	// neu ban btc_usdt thi khoa btc
	parts := strings.Split(input.Symbol, "_")
	if len(parts) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "symbol khong dung dinh dang"})
		return
	}

	baseasset := strings.ToUpper(parts[0])  // chuyen sang viet hoa de khop voi auth.go
	quoteasset := strings.ToUpper(parts[1]) // chuyen sang viet hoa de khop voi auth.go

	var assetlook string
	var amounttolock float64

	if input.Side == "BUY" {
		assetlook = quoteasset
		amounttolock = input.Price * input.Quantity
	} else if input.Side == "SELL" {
		assetlook = baseasset
		amounttolock = input.Quantity
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "side phai la buy hoac sell"})
		return
	}

	// bat dau giao dich database (transaction) de dam bao an toan
	tx := config.DB.Begin()

	// kiem tra vi cua nguoi dung
	var wallet models.Wallet
	if err := tx.Where("user_id = ? AND asset = ?", userid, assetlook).First(&wallet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "khong tim thay vi phu hop"})
		return
	}

	// kiem tra so du co du de khoa khong
	if wallet.Balance < amounttolock {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "so du khong du"})
		return
	}

	// thuc hien khoa quy
	wallet.Balance -= amounttolock
	wallet.LockedBalance += amounttolock
	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "loi cap nhat vi"})
		return
	}

	// tao doi tuong lenh moi
	neworder := models.Order{
		UserID:   userid,
		Symbol:   input.Symbol,
		Side:     input.Side,
		Type:     input.Type,
		Price:    input.Price,
		Quantity: input.Quantity,
		Filled:   0,
		Status:   "OPEN",
	}

	// luu lenh vao database
	if err := tx.Create(&neworder).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "loi tao lenh"})
		return
	}

	// commit giao dich database
	tx.Commit()

	// phan nay se goi matching engine de khop lenh ngay lap tuc
	go engine.RunMatchingEngine(neworder.Symbol)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "dat lenh thanh cong",
		"data":    neworder,
	})
}

// getorders lay danh sach lenh cua nguoi dung
func GetOrders(c *gin.Context) {
	userid := c.MustGet("user_id").(uint)

	var orders []models.Order
	config.DB.Where("user_id = ?", userid).Order("created_at desc").Find(&orders)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   orders,
	})
}

// cancelorder dung de huy mot lenh chua khop het
func CancelOrder(c *gin.Context) {
	userid := c.MustGet("user_id").(uint)
	orderid := c.Param("id")

	tx := config.DB.Begin()

	var order models.Order
	if err := tx.Where("id = ? AND user_id = ?", orderid, userid).First(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "khong tim thay lenh"})
		return
	}

	// chi cho phep huy lenh dang mo hoac khop mot phan
	if order.Status != "OPEN" && order.Status != "PARTIAL" {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "khong the huy lenh o trang thai nay"})
		return
	}

	// tinh toan so tien/asset can hoan lai cho nguoi dung
	parts := strings.Split(order.Symbol, "_")
	baseasset := strings.ToUpper(parts[0])
	quoteasset := strings.ToUpper(parts[1])

	var assettounlock string
	var amounttounlock float64

	remainingqty := order.Quantity - order.Filled

	if order.Side == "BUY" {
		assettounlock = quoteasset
		amounttounlock = remainingqty * order.Price
	} else {
		assettounlock = baseasset
		amounttounlock = remainingqty
	}

	// hoan lai tien vao vi
	var wallet models.Wallet
	if err := tx.Where("user_id = ? AND asset = ?", userid, assettounlock).First(&wallet).Error; err == nil {
		wallet.LockedBalance -= amounttounlock
		wallet.Balance += amounttounlock
		tx.Save(&wallet)
	}

	// cap nhat trang thai lenh thanh cancelled
	order.Status = "CANCELLED"
	tx.Save(&order)

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "da huy lenh thanh cong",
	})
}
