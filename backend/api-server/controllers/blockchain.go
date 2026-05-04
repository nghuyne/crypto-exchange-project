package controllers

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"crypto-exchange-backend/config"
	"github.com/gin-gonic/gin"
)

// GetBlockchainBlocks tra ve toan bo danh sach cac khoi audit tu chuoi khoi
func GetBlockchainBlocks(c *gin.Context) {
	// Lay du lieu blocks tu global variable config.AuditChain
	rawBlocks := config.AuditChain.Blocks
	
	type ResponseTransaction struct {
		OrderID   string  `json:"OrderID"`
		UserID    string  `json:"UserID"`
		Symbol    string  `json:"Symbol"`
		Amount    float64 `json:"Amount"`
		RiskScore int     `json:"RiskScore"`
		Action    string  `json:"Action"`
	}

	type ResponseBlock struct {
		Index        int                   `json:"Index"`
		Hash         string                `json:"Hash"`
		PrevHash     string                `json:"PrevHash"`
		Timestamp    string                `json:"Timestamp"`
		Transactions []ResponseTransaction `json:"Transactions"`
	}

	var response []ResponseBlock

	for _, b := range rawBlocks {
		var txs []ResponseTransaction
		
		for _, t := range b.Transactions {
			// Parse metadata JSON tu truong Data cua transaction trong block
			var meta map[string]interface{}
			err := json.Unmarshal([]byte(t.Data), &meta)
			
			if err == nil {
				// Neu la data hop le (co metadata AI)
				// "event" la key dung trong audit payload (order.go), khong phai "action"
				orderID := fmt.Sprintf("%v", meta["order_id"])
				if orderID == "<nil>" {
					orderID = "N/A" // ORDER_BLOCKED khong co order_id vi lenh chua duoc tao
				}
				txs = append(txs, ResponseTransaction{
					OrderID:   orderID,
					UserID:    fmt.Sprintf("%v", meta["user_id"]),
					Symbol:    fmt.Sprintf("%v", meta["symbol"]),
					Amount:    getFloatValue(meta["amount"]),
					RiskScore: getIntValue(meta["risk_score"]),
					Action:    fmt.Sprintf("%v", meta["event"]), // "event" khop voi key trong order.go
				})
			} else {
				// Day co the la block Genesis hoac data tho
				txs = append(txs, ResponseTransaction{
					Action: t.Data,
				})
			}
		}

		response = append(response, ResponseBlock{
			Index:        b.Index,
			Hash:         hex.EncodeToString(b.Hash),
			PrevHash:     hex.EncodeToString(b.PrevBlockHash),
			Timestamp:    time.Unix(b.Timestamp, 0).Format(time.RFC3339),
			Transactions: txs,
		})
	}

	c.JSON(http.StatusOK, response)
}

// Ham ho tro de lay gia tri float tu interface{} map
func getFloatValue(v interface{}) float64 {
	if f, ok := v.(float64); ok {
		return f
	}
	return 0
}

// Ham ho tro de lay gia tri int tu interface{} map
func getIntValue(v interface{}) int {
	if f, ok := v.(float64); ok {
		return int(f)
	}
	return 0
}
