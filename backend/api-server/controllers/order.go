package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/engine" // nhap engine cho phep khop lenh
	"crypto-exchange-backend/models"
	"crypto-exchange-backend/riskmanagement"

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

	// ============================================================
	// BUOC 2: AI Risk Check — Fail-Closed Pattern
	// Tai sao Fail-Closed? Neu AI bi loi ma van cho qua = he thong khong co bao ve.
	// Trong fintech, an toan > tinh san sang (availability).
	// ============================================================

	// Guard: dam bao AI Evaluator da duoc khoi tao truoc khi nhan request
	// Tai sao can guard nay? Vi InitAIBlockchain chay async sau ConnectDB/Redis.
	// Neu server nhan request truoc khi AI init xong -> nil pointer panic -> 500.
	// Fail-Closed: tra 503 ro rang con hon la panic hoac skip AI check.
	if config.AI_Evaluator == nil {
		log.Printf("⚠️ [CRITICAL] AI_Evaluator is nil — server not fully initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "error",
			"message": "He thong AI chua san sang, thu lai sau",
		})
		return
	}

	// Xay dung transaction de dua vao AI engine phan tich
	riskTx := riskmanagement.Transaction{
		TxID:      fmt.Sprintf("TX-%d-%d", userid, time.Now().UnixNano()),
		Sender:    fmt.Sprintf("user_%d", userid),
		Receiver:  input.Symbol,
		Amount:    input.Price * input.Quantity, // Tong gia tri USD cua lenh
		Quantity:  input.Quantity,
		Side:      input.Side,
		Timestamp: time.Now().Unix(),
	}

	// Goi AI EvaluateRisk voi panic recovery (Defense in Depth)
	// Tai sao can recover? Vi rule engine lam viec tren slice lich su -> co the panic
	// neu co race condition chua bi bat. Fail-Closed: panic = treat as HIGH risk.
	var riskLevel riskmanagement.RiskLevel
	var riskScore int
	var triggeredRules []string

	func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("🚨 [CRITICAL] AI Risk Engine panicked: %v — treating as HIGH risk (fail-closed)", r)
				riskLevel = riskmanagement.RiskLevel_HIGH
				riskScore = 999
				triggeredRules = []string{"Rule_Panic: AI engine crash — fail-closed block"}
			}
		}()
		riskLevel, riskScore, triggeredRules = config.AI_Evaluator.EvaluateRisk(riskTx)
	}()

	// BUOC 4: Log tat ca quyet dinh rui ro de thu thap data tinh chinh nguong
	// Tai sao log ca LOW? Vi can data de biet nguong 75/35 co phu hop khong (threshold tuning).
	log.Printf("🤖 [AI-RISK] user=%d symbol=%s side=%s amount=%.2f → level=%s score=%d rules=%v",
		userid, input.Symbol, input.Side, riskTx.Amount, riskLevel, riskScore, triggeredRules)

	// BUOC 5: Neu rui ro CAO -> audit trail + tu choi lenh
	if riskLevel == riskmanagement.RiskLevel_HIGH {
		// Ghi audit trail TRUOC khi tra loi 403
		// Tai sao audit truoc? Vi neu he thong crash sau khi tra loi -> mat bang chung compliance.
		// Tai sao van ghi audit du blockchain co the loi? Vi mat 1 audit record it nguy hiem
		// hon la cho qua 1 lenh rui ro cao ma khong co bang chung.
		auditPayload := map[string]interface{}{
			"event":          "ORDER_BLOCKED",
			"user_id":        userid,
			"symbol":         input.Symbol,
			"side":           input.Side,
			"amount":         riskTx.Amount,
			"risk_score":     riskScore,
			"risk_level":     string(riskLevel),
			"triggered_rules": triggeredRules,
			"timestamp":      time.Now().UTC().Format(time.RFC3339),
		}
		auditJSON, _ := json.Marshal(auditPayload)

		if err := config.AuditChain.AddAuditRecord(string(auditJSON)); err != nil {
			// Audit loi NHUNG VAN phai block lenh
			// Tai sao? Vi lenh nay THUC SU rui ro cao. Mat bang chung la bat tien,
			// nhung cho qua lenh nguy hiem la ap luc phap ly (DoS vector reasoning).
			log.Printf("🚨 [CRITICAL] ORDER_BLOCKED audit failed for user=%d: %v", userid, err)
		}

		c.JSON(http.StatusForbidden, gin.H{
			"status":          "error",
			"message":         "Lenh bi tu choi boi AI Risk Engine — rui ro qua cao",
			"risk_score":      riskScore,
			"risk_level":      string(riskLevel),
			"triggered_rules": triggeredRules,
		})
		return
	}

	// ============================================================
	// BUOC 6: Lock wallet + tao lenh trong DB (logic cu, khong thay doi)
	// ============================================================

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

	// ============================================================
	// BUOC 7: Audit ORDER_CREATED + start matching engine
	// Tai sao audit SAU commit? Vi phai chac chan lenh da vao DB truoc khi ghi blockchain.
	// Trade-off: co khoang trang giua DB commit va blockchain write (outbox pattern se fix hoan toan).
	// Hien tai: neu audit loi, log CRITICAL nhung VAN tra 200 (lenh da thuc su duoc tao).
	// Tai sao van tra 200? Vi rollback sau commit = inconsistent state con nguy hiem hon.
	// ============================================================
	auditPayload := map[string]interface{}{
		"event":      "ORDER_CREATED",
		"order_id":   neworder.ID,
		"user_id":    userid,
		"symbol":     input.Symbol,
		"side":       input.Side,
		"type":       input.Type,
		"price":      input.Price,
		"quantity":   input.Quantity,
		"amount":     riskTx.Amount,
		"risk_score": riskScore,
		"risk_level": string(riskLevel),
		"timestamp":  time.Now().UTC().Format(time.RFC3339),
	}
	auditJSON, _ := json.Marshal(auditPayload)

	if err := config.AuditChain.AddAuditRecord(string(auditJSON)); err != nil {
		// Audit loi nhung lenh da commit vao DB roi — van tra 200
		// TODO: can outbox pattern de dam bao consistency tuyet doi
		log.Printf("🚨 [CRITICAL] ORDER_CREATED audit failed for order_id=%d user=%d: %v",
			neworder.ID, userid, err)
	}

	// phan nay se goi matching engine de khop lenh ngay lap tuc
	go engine.RunMatchingEngine(neworder.Symbol)

	c.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"message":    "dat lenh thanh cong",
		"data":       neworder,
		"risk_score": riskScore,
		"risk_level": string(riskLevel),
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
