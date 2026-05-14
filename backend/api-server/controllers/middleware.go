package controllers

import (
	"net/http"
	"strings"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthRequired la middleware kiem tra JWT token
// Gan vao route nao thi route do yeu cau dang nhap moi truy cap duoc
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lay gia tri cua header "Authorization" trong request
		authHeader := c.GetHeader("Authorization")

		// Neu header rong hoac khong bat dau bang "Bearer " thi tu choi
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Khong co quyen truy cap!"})
			c.Abort() // Dung xu ly, khong cho di tiep vao controller
			return
		}

		// Cat bo chu "Bearer " de lay chuoi token thuan
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Dung jwtKey (khai bao trong auth.go cung package) de giai ma token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		// Neu token loi hoac het han thi tu choi
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Token khong hop le hoac da het han!"})
			c.Abort()
			return
		}

		// Lay user_id tu ben trong token va luu vao context de controller sau dung
		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", uint(claims["user_id"].(float64)))

		// Token hop le, cho di tiep vao controller
		c.Next()
	}
}

// AdminRequired la middleware kiem tra admin role
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "User ID not found"})
			c.Abort()
			return
		}

		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "User not found"})
			c.Abort()
			return
		}

		if user.Role != "ADMIN" && user.Role != "MODERATOR" {
			c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Yeu cau quyen admin!"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// LogAdminAction ghi log hanh dong admin
func LogAdminAction(adminID uint, action string, targetID uint, details string) error {
	log := models.AdminLog{
		AdminID:  adminID,
		Action:   action,
		TargetID: targetID,
		Details:  details,
	}
	return config.DB.Create(&log).Error
}
