package config

import (
	"crypto-exchange-backend/blockchain"
	"crypto-exchange-backend/riskmanagement"
	"fmt"
)

var (
	// Global Risk Engine
	AI_Evaluator *riskmanagement.RiskEvaluator
	// Global Audit Trail
	AuditChain   *blockchain.Blockchain
)

// InitAIBlockchain khởi tạo hệ thống trí tuệ nhân tạo và chuỗi bảo mật
func InitAIBlockchain() {
	fmt.Println("🤖 Đang kích hoạt AI Risk Engine...")
	AI_Evaluator = riskmanagement.NewRiskEvaluator()
	
	fmt.Println("⛓️ Đang kết nối Chuỗi Kiểm toán Blockchain...")
	AuditChain = blockchain.NewBlockchain()
}
