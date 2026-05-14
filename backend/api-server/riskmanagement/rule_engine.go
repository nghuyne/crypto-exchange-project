package riskmanagement

import (
	"fmt"
	"math"
	"strconv"
	"sync"
	"time"
)

// RiskLevel dinh nghia cac muc do rui ro
type RiskLevel string

const (
	RiskLevel_LOW    RiskLevel = "LOW"
	RiskLevel_MEDIUM RiskLevel = "MEDIUM"
	RiskLevel_HIGH   RiskLevel = "HIGH"
)

// Ngưỡng điểm rủi ro — ánh xạ tới switch-case trong EvaluateRisk()
// Tại sao 75 cho HIGH? Vì một rule đơn lẻ cao nhất chỉ cho 60 điểm (Rule_Extreme_Amount).
// Cần ít nhất 2 rule bị vi phạm đồng thời mới block → giảm false positive.
// Tại sao 35 cho MEDIUM? Một rule lớn (vd: Velocity +30) là đủ để cảnh báo.
// Mapping: score < 35 → LOW, 35 ≤ score < 75 → MEDIUM (warn), score ≥ 75 → HIGH (block).
const (
	RiskThresholdHigh   = 75 // >= 75: block order (RiskLevel_HIGH)
	RiskThresholdMedium = 35 // >= 35: warn + audit (RiskLevel_MEDIUM)
)

// Transaction dai dien cho mot giao dich (anh xa tu Order cua san)
type Transaction struct {
	TxID      string
	Sender    string
	Receiver  string  // symbol, vd: "btc_usdt"
	Amount    float64 // Price * Quantity
	Quantity  float64 // So luong coin
	Side      string  // "BUY" hoac "SELL"
	Timestamp int64
}

// RiskEvaluator chua cau hinh va lich su giao dich de phan tich rui ro
type RiskEvaluator struct {
	// --- Nguong canh bao (co the dieu chinh theo moi truong) ---
	// Tai sao khong hardcode 1000? Vi nguong phu thuoc vao loai san (retail vs institutional).
	// Moi truong test nen dat thap, production can dat cao hon.
	AmountThreshold     float64 // Gia tri lenh (USD) bi coi la lon
	FrequencyThreshold  int     // So lenh toi da trong TimeWindowSeconds
	RepetitiveThreshold int     // So lenh giong nhau lien tiep bi coi la bot
	TimeWindowSeconds   int64   // Cua so thoi gian kiem tra (giay)
	VelocityThreshold   float64 // % thay doi gia tri lenh dot ngot (so sanh lenh hien tai vs trung binh)

	TransactionHistory map[string][]Transaction
	mu                 sync.RWMutex
}

// NewRiskEvaluator tao instance moi voi nguong hop ly hon cho san crypto
// DEMO THRESHOLDS: Lowered for easier triggering during product demonstration
// Production should use higher thresholds to reduce false positives
func NewRiskEvaluator() *RiskEvaluator {
	re := &RiskEvaluator{
		AmountThreshold:     10000,  // DEMO: $10,000 triggers large order warning (was $50,000)
		                             // Allows testing AI blocking with realistic order sizes
		FrequencyThreshold:  5,      // DEMO: 5 orders in 5 min = spam (was 20)
		                             // Makes bot/spam detection easier: 6+ orders = triggered
		RepetitiveThreshold: 3,      // DEMO: 3 same orders = bot pattern (was 5)
		                             // Easier to demonstrate bot detection
		TimeWindowSeconds:   300,    // Cua so 5 phut
		VelocityThreshold:   3.0,    // DEMO: 3x average = suspicious spike (was 10.0)
		                             // Sensitive to sudden order size changes
		TransactionHistory:  make(map[string][]Transaction),
	}
	// Chay goroutine don dep lich su cu de tranh memory leak
	// Tai sao can cleanup? Vi map chi tang, khong tu giam -> OOM theo thoi gian
	go re.startCleanupWorker()
	return re
}

// startCleanupWorker don dep lich su giao dich cu dinh ky (moi 10 phut)
func (re *RiskEvaluator) startCleanupWorker() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		re.cleanupOldTransactions()
	}
}

// cleanupOldTransactions xoa giao dich qua cu khoi bo nho
// Giu lai giao dich trong vong 2x TimeWindow de dam bao du lieu phan tich chinh xac
func (re *RiskEvaluator) cleanupOldTransactions() {
	re.mu.Lock()
	defer re.mu.Unlock()

	cutoff := time.Now().Unix() - (re.TimeWindowSeconds * 2)
	cleaned := 0
	for sender, txs := range re.TransactionHistory {
		var kept []Transaction
		for _, tx := range txs {
			if tx.Timestamp >= cutoff {
				kept = append(kept, tx)
			} else {
				cleaned++
			}
		}
		if len(kept) == 0 {
			delete(re.TransactionHistory, sender)
		} else {
			re.TransactionHistory[sender] = kept
		}
	}
	if cleaned > 0 {
		fmt.Printf("🧹 [RiskEngine] Da don dep %d giao dich cu khoi bo nho\n", cleaned)
	}
}

// EvaluateRisk tinh diem rui ro cho mot lenh giao dich
// Tra ve: (muc_rui_ro, diem_so, danh_sach_rules_vi_pham)
func (re *RiskEvaluator) EvaluateRisk(tx Transaction) (RiskLevel, int, []string) {
	re.mu.Lock()
	defer re.mu.Unlock()

	riskScore := 0
	triggeredRules := []string{}

	// === RULE 1: Gia tri lenh qua lon (Large Order) ===
	// Ly do: Lenh lon dot ngot co the la market manipulation hoac loi he thong.
	if tx.Amount > re.AmountThreshold {
		ratio := tx.Amount / re.AmountThreshold
		if ratio >= 10 {
			riskScore += 60
			triggeredRules = append(triggeredRules,
				fmt.Sprintf("Rule_Extreme_Amount: Gia tri lenh %.0f$ >> nguong %.0f$ (x%.0f lan) - Rui ro cuc cao",
					tx.Amount, re.AmountThreshold, ratio))
		} else if ratio >= 3 {
			riskScore += 35
			triggeredRules = append(triggeredRules,
				fmt.Sprintf("Rule_High_Amount: Gia tri lenh %.0f$ vuot nguong x%.0f lan",
					tx.Amount, ratio))
		} else {
			riskScore += 15
			triggeredRules = append(triggeredRules,
				fmt.Sprintf("Rule_Amount: Gia tri lenh %.0f$ lon hon nguong %.0f$",
					tx.Amount, re.AmountThreshold))
		}
	}

	// === RULE 2: Tan suat dat lenh qua cao (Spam/DDoS) ===
	// Ly do: Bot thuong dat rat nhieu lenh nho trong thoi gian ngan de thu thach he thong
	// hoac de "test" gia truoc khi dat lenh lon.
	recentCount := re.countTransactionsInTimeWindow(tx.Sender, re.TimeWindowSeconds)
	if recentCount > re.FrequencyThreshold {
		excess := recentCount - re.FrequencyThreshold
		score := int(math.Min(float64(excess)*3, 45)) // Toi da 45 diem cho rule nay
		riskScore += score
		triggeredRules = append(triggeredRules,
			fmt.Sprintf("Rule_Frequency: %d lenh trong %ds (gioi han: %d) - +%d diem",
				recentCount, re.TimeWindowSeconds, re.FrequencyThreshold, score))
	}

	// === RULE 3: Hanh vi lap lai (Bot Pattern) ===
	// Ly do: Bot thuong dat lenh voi cung gia/so luong de thu hoat dong cua market maker.
	if re.isRepetitiveAction(tx) {
		riskScore += 25
		triggeredRules = append(triggeredRules,
			"Rule_Repetitive: Phat hien mau lenh lap lai (cung receiver + amount >= 5 lan)")
	}

	// === RULE 4: Velocity Spike (Dot bien gia tri lenh) ===
	// Ly do: Neu binh thuong user dat lenh $100, dot nhien dat $5000 -> co the la tai khoan bi hack
	// hoac phat trien thanh phan ma doc.
	avgAmount := re.getAverageAmount(tx.Sender)
	if avgAmount > 0 && tx.Amount > 0 {
		velocityRatio := tx.Amount / avgAmount
		if velocityRatio > re.VelocityThreshold {
			riskScore += 30
			triggeredRules = append(triggeredRules,
				fmt.Sprintf("Rule_Velocity: Gia tri lenh %.0f$ lon hon %.1fx trung binh lich su (%.0f$)",
					tx.Amount, velocityRatio, avgAmount))
		}
	}

	// === RULE 5: Dao chieu vi the nhanh (Rapid Position Reversal) ===
	// Ly do: Dat lenh MUA lon roi ngay lap tuc BAN (hoac nguoc lai) trong cung 1 phut
	// la dau hieu cua wash trading (giao dich gia tao de thao tung gia).
	if re.isRapidReversal(tx) {
		riskScore += 20
		triggeredRules = append(triggeredRules,
			"Rule_Reversal: Dao chieu vi the nhanh (BUY->SELL hoac SELL->BUY trong 60s) - Co the la wash trading")
	}

	// Ghi nhan giao dich vao lich su sau khi da phan tich
	re.recordTransaction(tx)

	// --- Xac dinh muc rui ro cuoi cung ---
	// Nguong: >= 75 = HIGH (bi chan), >= 35 = MEDIUM (canh bao), < 35 = LOW (binh thuong)
	var riskLevel RiskLevel
	switch {
	case riskScore >= 75:
		riskLevel = RiskLevel_HIGH
	case riskScore >= 35:
		riskLevel = RiskLevel_MEDIUM
	default:
		riskLevel = RiskLevel_LOW
	}

	return riskLevel, riskScore, triggeredRules
}

// isRepetitiveAction kiem tra neu user dang lap lai cung 1 lenh nhieu lan
func (re *RiskEvaluator) isRepetitiveAction(tx Transaction) bool {
	txs, exists := re.TransactionHistory[tx.Sender]
	if !exists {
		return false
	}
	count := 0
	// Chi kiem tra trong cua so thoi gian, khong kiem tra toan bo lich su
	cutoff := time.Now().Unix() - re.TimeWindowSeconds
	for i := len(txs) - 1; i >= 0; i-- {
		prev := txs[i]
		if prev.Timestamp < cutoff {
			break // Dung lai neu qua cu
		}
		if prev.Receiver == tx.Receiver && math.Abs(prev.Amount-tx.Amount) < 0.01 {
			count++
		}
	}
	return count >= re.RepetitiveThreshold
}

// countTransactionsInTimeWindow dem so lenh cua sender trong cua so thoi gian
func (re *RiskEvaluator) countTransactionsInTimeWindow(sender string, windowSeconds int64) int {
	txs, exists := re.TransactionHistory[sender]
	if !exists {
		return 0
	}
	count := 0
	cutoff := time.Now().Unix() - windowSeconds
	for i := len(txs) - 1; i >= 0; i-- {
		if txs[i].Timestamp < cutoff {
			break
		}
		count++
	}
	return count
}

// getAverageAmount tinh trung binh gia tri lenh cua user trong 24 gio gan nhat
func (re *RiskEvaluator) getAverageAmount(sender string) float64 {
	txs, exists := re.TransactionHistory[sender]
	if !exists || len(txs) == 0 {
		return 0
	}
	cutoff := time.Now().Unix() - 86400 // 24 gio
	total := 0.0
	count := 0
	for _, tx := range txs {
		if tx.Timestamp >= cutoff {
			total += tx.Amount
			count++
		}
	}
	if count == 0 {
		return 0
	}
	return total / float64(count)
}

// isRapidReversal kiem tra neu user dao chieu vi the (BUY->SELL) trong thoi gian ngan
func (re *RiskEvaluator) isRapidReversal(tx Transaction) bool {
	if tx.Side == "" {
		return false // Khong du thong tin de kiem tra
	}
	txs, exists := re.TransactionHistory[tx.Sender]
	if !exists {
		return false
	}
	cutoff := time.Now().Unix() - 60 // Trong vong 60 giay
	oppositeSide := "BUY"
	if tx.Side == "BUY" {
		oppositeSide = "SELL"
	}
	for i := len(txs) - 1; i >= 0; i-- {
		prev := txs[i]
		if prev.Timestamp < cutoff {
			break
		}
		// Tim lenh nguoc chieu voi cung symbol va gia tri dang ke (> 10% gia tri lenh hien tai)
		if prev.Side == oppositeSide && prev.Receiver == tx.Receiver && prev.Amount > tx.Amount*0.1 {
			return true
		}
	}
	return false
}

// recordTransaction luu giao dich vao lich su
func (re *RiskEvaluator) recordTransaction(tx Transaction) {
	re.TransactionHistory[tx.Sender] = append(re.TransactionHistory[tx.Sender], tx)
}

func formatFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', 2, 64)
}
