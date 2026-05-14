package controllers

import (
	"net/http"
	"time"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Day la mat ma doc quyen cua server, dung de dong dau ky ten vao ve JWT
var jwtKey = []byte("mat_ma_bi_mat_cua_crypto_exchange")

// API Dang Ky
func Register(c *gin.Context) {
	// Dinh nghia cau truc hung du lieu tu nguoi dung gui len
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
		FullName string `json:"full_name" binding:"required"`
	}

	// Kiem tra du lieu dau vao xem co du khong
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Thieu thong tin dau vao!"})
		return
	}

	// Buoc 1: Tien hanh ma hoa mat khau bang bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Loi ky thuat he thong ma hoa!"})
		return
	}

	// Buoc 2: Tao User moi va luu vao Database
	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
		FullName: input.FullName,
	}

	// GORM se nem ra loi result.Error neu Email nay da bi trung lap vi ta dat uniqueIndex o File Domain
	if result := config.DB.Create(&user); result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Email nay da duoc su dung!"})
		return
	}

	// Buoc 3: Tu dong trang bi 3c Vi tien ranh rong voi seed balance cho demo testing
	// USDT: 1,000,000 - enough for large high-risk orders to test AI blocking
	// BTC: 10 - for testing BTC trading pairs
	// ETH: 100 - for testing ETH trading pairs
	wallets := []models.Wallet{
		{UserID: user.ID, Asset: "USDT", Balance: 1000000, LockedBalance: 0},
		{UserID: user.ID, Asset: "BTC", Balance: 10, LockedBalance: 0},
		{UserID: user.ID, Asset: "ETH", Balance: 100, LockedBalance: 0},
	}
	config.DB.Create(&wallets)

	// Tra loi tuyet doi thao tac hoan tat
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Dang ky tai khoan thanh cong!"})
}

// API Dang Nhap
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Thieu email hoac password!"})
		return
	}

	// Buoc 1: Truy van xem Email nay co ton tai khong
	var user models.User
	if result := config.DB.Where("email = ?", input.Email).First(&user); result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Tai khoan khong ton tai!"})
		return
	}

	// Buoc 2: Dung thu vien bcrypt so sanh chuoi hash trong Database voi cai mat khau thao khach go
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Mat khau ban bi sai!"})
		return
	}

	// Buoc 3: Tao phieu JWT co han su dung 24 tieng
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Khong the tao quyen dang nhap!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Dang nhap thanh cong!",
		"data": map[string]interface{}{
			"token": tokenString,
			"role":  user.Role,
		},
	})
}

// API Lay Thong Tin User Hien Tai
func GetMe(c *gin.Context) {
	// AuthRequired() middleware da extract user_id tu JWT va luu vao context
	userID := c.MustGet("user_id").(uint)

	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Khong tim thay user!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": map[string]interface{}{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
			"created_at": user.CreatedAt,
		},
	})
}

