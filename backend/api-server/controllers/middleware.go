package controllers

import (
	"net/http"
	"strings"

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
