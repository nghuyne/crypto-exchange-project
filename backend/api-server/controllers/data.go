package controllers

// ============================================================
// DATA MODULE — AGGREGATION LAYER CHO DATASCREEN
// ============================================================
// Tại sao cần module này?
//
// Frontend (DataScreen.tsx) cần hiển thị bức tranh tổng hợp:
//   - Market data (giá, volume, xu hướng từng cặp)
//   - Blockchain audit (số block, risk score từ AI)
//   - Sentiment (tâm lý thị trường, Fear & Greed Index)
//   - System snapshot (tổng lệnh, user hoạt động)
//
// Thay vì để frontend tự gọi nhiều endpoint rồi tổng hợp ở client,
// ta tập trung logic tổng hợp tại backend → giảm số round-trip,
// frontend chỉ cần 4 lần fetch để vẽ toàn bộ DataScreen.
//
// Pattern này gọi là "Backend For Frontend" (BFF) — phổ biến
// trong kiến trúc microservices và sàn giao dịch thực tế.
// ============================================================

import (
	"encoding/json"
	"math"
	"net/http"
	"strings"
	"time"

	"crypto-exchange-backend/config"
	"crypto-exchange-backend/models"

	"github.com/gin-gonic/gin"
)

// ============================================================
// STRUCT NỘI BỘ
// ============================================================

// pairSummary tóm tắt thông tin giao dịch 24h của một cặp tiền tệ.
// Tại sao định nghĩa struct riêng thay vì dùng models.Trade?
// Vì models.Trade chứa dữ liệu thô của từng giao dịch riêng lẻ,
// còn pairSummary là kết quả tổng hợp (aggregated) từ nhiều Trade.
// Hai khái niệm khác nhau về mặt nghiệp vụ → cần struct riêng.
type pairSummary struct {
	Symbol        string  `json:"symbol"`
	BaseAsset     string  `json:"base_asset"`
	QuoteAsset    string  `json:"quote_asset"`
	LastPrice     float64 `json:"last_price"`
	OpenPrice24h  float64 `json:"open_price_24h"`
	High24h       float64 `json:"high_24h"`
	Low24h        float64 `json:"low_24h"`
	Change24h     float64 `json:"change_24h"`   // % thay đổi so với giá mở cửa 24h trước
	Volume24h     float64 `json:"volume_24h"`   // Tổng giá trị danh nghĩa (price × quantity)
	TradeCount24h int     `json:"trade_count_24h"`
	Direction     string  `json:"direction"` // "BULLISH" | "BEARISH" | "NEUTRAL"
	Intensity     float64 `json:"intensity"` // 0–100, tỉ lệ volume so với cặp sôi động nhất
	UpdatedAt     string  `json:"updated_at"`
}

// blockchainAuditStats chứa số liệu tổng hợp từ Blockchain Audit Trail.
// Tách ra struct riêng vì cả /overview lẫn /sentiment đều cần dùng,
// giúp tránh đọc lặp lại dữ liệu blockchain (DRY principle).
type blockchainAuditStats struct {
	TotalAuditRecords int
	TotalRiskScore    int
	HighRiskCount     int // Số giao dịch bị AI đánh risk_score >= 70
	AuditBlocks       int
	LatestAuditBlock  int
}

// ============================================================
// HELPER: computePairSummaries
// ============================================================
// Lý do tách ra thành helper function:
//   - /data/coins cần danh sách đầy đủ, sắp theo symbol
//   - /data/heatmap cần cùng dữ liệu đó nhưng sắp theo volume
//   - /data/overview cần dùng để tính bullish/bearish/neutral counts
//   Ba endpoint dùng chung → tách ra → không lặp code (DRY).
//
// Chiến lược query:
//   Bước 1: 1 query GROUP BY lấy MAX/MIN/SUM/COUNT cho tất cả symbols.
//   Bước 2: Với mỗi symbol, 2 query nhỏ lấy giá đầu/cuối 24h.
//   Tổng cộng: 1 + 2N queries (N = số cặp giao dịch).
//   Với sàn demo ít cặp, cách này rõ ràng và dễ bảo trì hơn CTE/subquery.
// ============================================================
func computePairSummaries() []pairSummary {
	// Cửa sổ thời gian: 24 giờ gần nhất
	since := time.Now().Add(-24 * time.Hour)

	// --- Bước 1: Truy vấn tổng hợp stats per symbol trong 24h ---
	// Dùng raw SQL vì GORM không hỗ trợ GROUP BY kết hợp aggregate function
	// một cách tường minh qua ORM syntax.
	type rawStat struct {
		Symbol        string
		High24h       float64
		Low24h        float64
		Volume24h     float64
		TradeCount24h int64
	}
	var rawStats []rawStat
	config.DB.Raw(`
		SELECT
			symbol,
			MAX(price)            AS high_24h,
			MIN(price)            AS low_24h,
			SUM(price * quantity) AS volume_24h,
			COUNT(*)              AS trade_count_24h
		FROM trades
		WHERE created_at >= ?
		GROUP BY symbol
	`, since).Scan(&rawStats)

	// Nếu chưa có giao dịch nào → trả về mảng rỗng (không trả null)
	// Tại sao không trả null? Frontend dùng .map() → null sẽ crash.
	if len(rawStats) == 0 {
		return []pairSummary{}
	}

	// --- Bước 2: Tìm volume lớn nhất để chuẩn hóa intensity về [0, 100] ---
	// intensity = volume của cặp này / volume của cặp sôi động nhất × 100
	// Tại sao cần intensity? Frontend dùng nó để vẽ thanh heat bar trực quan.
	// Không dùng giá trị tuyệt đối vì volume giữa các cặp chênh lệch rất lớn.
	var maxVolume float64
	for _, s := range rawStats {
		if s.Volume24h > maxVolume {
			maxVolume = s.Volume24h
		}
	}

	// --- Bước 3: Build PairSummary đầy đủ cho từng symbol ---
	summaries := make([]pairSummary, 0, len(rawStats))

	for _, stat := range rawStats {
		// Giá mở cửa = giao dịch đầu tiên trong cửa sổ 24h
		// Nghiệp vụ: dùng để tính % thay đổi (change_24h)
		var firstTrade models.Trade
		config.DB.Where("symbol = ? AND created_at >= ?", stat.Symbol, since).
			Order("created_at ASC").Limit(1).Find(&firstTrade)

		// Giá hiện tại = giao dịch khớp lệnh gần nhất (không giới hạn 24h)
		// Tại sao không giới hạn 24h? Nếu không có trade trong 24h,
		// vẫn cần hiển thị last_price của lần giao dịch cuối cùng.
		var lastTrade models.Trade
		config.DB.Where("symbol = ?", stat.Symbol).
			Order("created_at DESC").Limit(1).Find(&lastTrade)

		// % thay đổi 24h = (giá hiện tại − giá mở) / giá mở × 100
		// Công thức chuẩn của mọi sàn giao dịch (Binance, Coinbase...)
		var change24h float64
		if firstTrade.Price > 0 {
			change24h = (lastTrade.Price-firstTrade.Price)/firstTrade.Price*100
			// Làm tròn 2 chữ số thập phân để tránh floating-point noise
			change24h = math.Round(change24h*100) / 100
		}

		// Xác định xu hướng thị trường của cặp giao dịch này
		// Ngưỡng ±1%: đủ nhạy với biến động crypto nhưng không quá nhiễu
		// (crypto biến động mạnh hơn chứng khoán → ngưỡng 1% là hợp lý)
		direction := "NEUTRAL"
		if change24h > 1.0 {
			direction = "BULLISH"
		} else if change24h < -1.0 {
			direction = "BEARISH"
		}

		// intensity: chuẩn hóa volume về [0, 100] so với cặp sôi động nhất
		intensity := 0.0
		if maxVolume > 0 {
			intensity = math.Round(stat.Volume24h/maxVolume*100*10) / 10
		}

		// Parse base_asset và quote_asset từ symbol convention: "btc_usdt"
		// Quy ước của sàn: [base]_[quote], phân tách bằng dấu gạch dưới
		parts := strings.SplitN(stat.Symbol, "_", 2)
		baseAsset, quoteAsset := stat.Symbol, "usdt"
		if len(parts) == 2 {
			baseAsset = parts[0]
			quoteAsset = parts[1]
		}

		summaries = append(summaries, pairSummary{
			Symbol:        stat.Symbol,
			BaseAsset:     baseAsset,
			QuoteAsset:    quoteAsset,
			LastPrice:     lastTrade.Price,
			OpenPrice24h:  firstTrade.Price,
			High24h:       stat.High24h,
			Low24h:        stat.Low24h,
			Change24h:     change24h,
			Volume24h:     stat.Volume24h,
			TradeCount24h: int(stat.TradeCount24h),
			Direction:     direction,
			Intensity:     intensity,
			UpdatedAt:     time.Now().Format(time.RFC3339),
		})
	}

	return summaries
}

// ============================================================
// HELPER: computeBlockchainStats
// ============================================================
// Đọc toàn bộ Blockchain Audit Trail trong bộ nhớ và tổng hợp:
//   - Số block, số bản ghi audit
//   - Tổng risk score và số giao dịch rủi ro cao
//
// Tại sao đọc từ bộ nhớ (in-memory) thay vì DB?
// AuditChain là blockchain lưu vào file .db riêng biệt (blockchain_audit.db),
// không qua PostgreSQL/MySQL. Đây là thiết kế có chủ ý:
// dữ liệu audit cần tính bất biến (immutability) của blockchain,
// không thể UPDATE/DELETE như bảng thông thường trong RDBMS.
// ============================================================
func computeBlockchainStats() blockchainAuditStats {
	if config.AuditChain == nil {
		return blockchainAuditStats{}
	}

	blocks := config.AuditChain.Blocks
	stats := blockchainAuditStats{
		AuditBlocks: len(blocks),
	}

	// Block cuối cùng có Index lớn nhất
	if len(blocks) > 0 {
		stats.LatestAuditBlock = blocks[len(blocks)-1].Index
	}

	for _, block := range blocks {
		for _, tx := range block.Transactions {
			// Mỗi transaction trong audit blockchain lưu metadata JSON
			// do AI Risk Engine tạo ra khi xử lý lệnh (xem controllers/order.go)
			var meta map[string]interface{}
			if err := json.Unmarshal([]byte(tx.Data), &meta); err != nil {
				// Block Genesis hoặc dữ liệu thô (không phải JSON) → bỏ qua
				continue
			}
			stats.TotalAuditRecords++

			if rs, ok := meta["risk_score"].(float64); ok {
				stats.TotalRiskScore += int(rs)
				// Ngưỡng rủi ro cao: risk_score >= 70 (thang 0–100)
				// Được định nghĩa bởi AI Risk Engine trong riskmanagement/rule_engine.go
				if int(rs) >= 70 {
					stats.HighRiskCount++
				}
			}
		}
	}

	return stats
}

// ============================================================
// GET /api/v1/data/overview
// ============================================================
// Trả về bức tranh tổng quan toàn hệ thống trong cửa sổ 24h.
// Đây là endpoint "nặng" nhất vì phải tổng hợp từ nhiều nguồn:
//   - Bảng orders (tổng lệnh, lệnh mở)
//   - Bảng trades (volume, active users)
//   - computePairSummaries() (bullish/bearish, top movers)
//   - computeBlockchainStats() (risk, audit)
//
// Response format: { "data": { ...OverviewData } }
// Lý do bọc trong "data": convention nhất quán với toàn bộ API
// của hệ thống, giúp frontend dễ destructure.
// ============================================================
func GetDataOverview(c *gin.Context) {
	since := time.Now().Add(-24 * time.Hour)

	// Lấy dữ liệu tổng hợp từ hai helper dùng chung
	summaries := computePairSummaries()
	bcStats := computeBlockchainStats()

	// --- Chỉ số từ bảng orders ---
	var totalOrders, openOrders int64
	config.DB.Model(&models.Order{}).Count(&totalOrders)
	config.DB.Model(&models.Order{}).
		Where("status IN (?, ?)", "OPEN", "PARTIAL").Count(&openOrders)

	// --- Chỉ số từ bảng trades ---
	var totalTrades int64
	config.DB.Model(&models.Trade{}).Count(&totalTrades)

	// Active users = số user duy nhất đặt ít nhất 1 lệnh trong 24h
	// DISTINCT vì 1 user có thể đặt hàng chục lệnh trong ngày
	var activeUsers int64
	config.DB.Model(&models.Order{}).
		Where("created_at >= ?", since).
		Distinct("user_id").Count(&activeUsers)

	// Tổng volume = tổng giá trị danh nghĩa (notional value) các trade trong 24h
	// Notional value = price × quantity (đơn vị: USDT)
	// Khác với "số lượng coin" — đây là thước đo thanh khoản thực tế của sàn
	type volResult struct{ Total float64 }
	var volRes volResult
	config.DB.Raw(`
		SELECT COALESCE(SUM(price * quantity), 0) AS total
		FROM trades
		WHERE created_at >= ?
	`, since).Scan(&volRes)

	// --- Phân loại xu hướng và tìm top movers ---
	var bullish, bearish, neutral int
	for _, s := range summaries {
		switch s.Direction {
		case "BULLISH":
			bullish++
		case "BEARISH":
			bearish++
		default:
			neutral++
		}
	}

	// Sao chép để sắp xếp mà không thay đổi slice gốc
	sorted := make([]pairSummary, len(summaries))
	copy(sorted, summaries)

	// Top gainers: 3 cặp tăng mạnh nhất trong 24h
	sortByChange(sorted, true)
	topGainers := make([]pairSummary, 0)
	if len(sorted) >= 3 {
		topGainers = sorted[:3]
	} else {
		topGainers = sorted
	}

	// Top losers: 3 cặp giảm mạnh nhất trong 24h
	sortByChange(sorted, false)
	topLosers := make([]pairSummary, 0)
	if len(sorted) >= 3 {
		topLosers = sorted[:3]
	} else {
		topLosers = sorted
	}

	// Fear & Greed Index: tỉ lệ cặp BULLISH / tổng số cặp có dữ liệu
	// Công thức: 0 = Extreme Fear (toàn thị trường đỏ), 100 = Extreme Greed (toàn xanh)
	fearGreedIndex := 50.0
	totalPairs := bullish + bearish + neutral
	if totalPairs > 0 {
		fearGreedIndex = math.Round(float64(bullish) / float64(totalPairs) * 100)
	}

	avgRiskScore := 0
	if bcStats.TotalAuditRecords > 0 {
		avgRiskScore = bcStats.TotalRiskScore / bcStats.TotalAuditRecords
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"generated_at":       time.Now().Format(time.RFC3339),
			"window_hours":       24,
			"total_pairs":        len(summaries),
			"total_orders":       totalOrders,
			"open_orders":        openOrders,
			"total_trades":       totalTrades,
			"active_users":       activeUsers,
			"total_volume":       volRes.Total,
			"bullish_pairs":      bullish,
			"bearish_pairs":      bearish,
			"neutral_pairs":      neutral,
			"fear_greed_index":   fearGreedIndex,
			"average_risk_score": avgRiskScore,
			"high_risk_records":  bcStats.HighRiskCount,
			"audit_records":      bcStats.TotalAuditRecords,
			"audit_blocks":       bcStats.AuditBlocks,
			"latest_audit_block": bcStats.LatestAuditBlock,
			"top_gainers":        topGainers,
			"top_losers":         topLosers,
		},
	})
}

// ============================================================
// GET /api/v1/data/coins
// ============================================================
// Trả về danh sách đầy đủ các cặp giao dịch với stats 24h.
// Dùng cho:
//   - Bảng "Cryptocurrency Details" (có tìm kiếm + filter)
//   - Tính năng Export CSV (frontend tự xử lý, backend chỉ trả data)
//
// Response format: { "data": { "items": [...PairSummary] } }
// Lý do bọc trong "items": cho phép sau này thêm pagination
// (total_count, page, per_page) mà không breaking change frontend.
// ============================================================
func GetDataCoins(c *gin.Context) {
	summaries := computePairSummaries()

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"items": summaries,
		},
	})
}

// ============================================================
// GET /api/v1/data/heatmap
// ============================================================
// Trả về danh sách cặp giao dịch SẮP XẾP THEO VOLUME GIẢM DẦN.
// Dùng cho panel "Trading Heatmap" — visualize cặp nào đang
// có thanh khoản cao nhất (sôi động nhất) trong 24h.
//
// Tại sao là endpoint riêng thay vì dùng /coins?
// Tách ra giúp dễ thay đổi logic độc lập sau này.
// Ví dụ: heatmap có thể cần filter thêm (chỉ lấy top 20),
// trong khi /coins luôn trả toàn bộ.
// ============================================================
func GetDataHeatmap(c *gin.Context) {
	summaries := computePairSummaries()

	// Sắp xếp theo volume giảm dần → cặp "nóng" nhất lên đầu
	sortByVolume(summaries)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"items": summaries,
		},
	})
}

// ============================================================
// GET /api/v1/data/sentiment
// ============================================================
// Trả về phân tích tâm lý thị trường (Market Sentiment).
//
// Tại sao gọi là "AI Sentiment"?
// Vì Fear & Greed Index được tính từ dữ liệu real-time của hệ thống
// kết hợp với risk_score do AI Risk Engine (riskmanagement package) tạo ra.
// Đây không phải AI học máy (ML) truyền thống, mà là rule-based AI
// — vẫn là "trí tuệ nhân tạo" theo nghĩa rộng (hệ thống tự suy luận).
//
// Công thức Fear & Greed Index:
//   index = (số cặp BULLISH / tổng số cặp) × 100
//   0  = Extreme Fear  (tất cả bearish)
//   50 = Neutral
//   100 = Extreme Greed (tất cả bullish)
// ============================================================
func GetDataSentiment(c *gin.Context) {
	summaries := computePairSummaries()
	bcStats := computeBlockchainStats()

	var bullish, bearish, neutral int
	for _, s := range summaries {
		switch s.Direction {
		case "BULLISH":
			bullish++
		case "BEARISH":
			bearish++
		default:
			neutral++
		}
	}

	total := bullish + bearish + neutral

	var bullishPct, bearishPct, neutralPct, fearGreedIndex float64
	if total > 0 {
		// Làm tròn 1 chữ số thập phân cho % hiển thị (vd: 66.7%)
		bullishPct = math.Round(float64(bullish)/float64(total)*100*10) / 10
		bearishPct = math.Round(float64(bearish)/float64(total)*100*10) / 10
		neutralPct = math.Round(float64(neutral)/float64(total)*100*10) / 10
		fearGreedIndex = math.Round(float64(bullish) / float64(total) * 100)
	} else {
		// Không có dữ liệu trade → mặc định neutral
		bullishPct, bearishPct, neutralPct = 0, 0, 100
		fearGreedIndex = 50
	}

	// Phân loại tâm lý thị trường dựa trên Fear & Greed Index
	// Ngưỡng: <40 = FEAR, 40–60 = NEUTRAL, >60 = GREED
	// (Tham khảo từ chỉ số Fear & Greed Index của crypto thực tế)
	marketMood := "NEUTRAL"
	if fearGreedIndex >= 60 {
		marketMood = "GREED"
	} else if fearGreedIndex <= 40 {
		marketMood = "FEAR"
	}

	avgRiskScore := 0
	if bcStats.TotalAuditRecords > 0 {
		avgRiskScore = bcStats.TotalRiskScore / bcStats.TotalAuditRecords
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"fear_greed_index":   fearGreedIndex,
			"market_mood":        marketMood,
			"bullish_percent":    bullishPct,
			"bearish_percent":    bearishPct,
			"neutral_percent":    neutralPct,
			"average_risk_score": avgRiskScore,
			"high_risk_records":  bcStats.HighRiskCount,
			"audit_records":      bcStats.TotalAuditRecords,
			"audit_blocks":       bcStats.AuditBlocks,
		},
	})
}

// ============================================================
// SORT HELPERS
// ============================================================
// Dùng bubble sort thay vì sort.Slice vì:
//   1. Số cặp giao dịch trên sàn demo rất nhỏ (< 20) → O(n²) không ảnh hưởng
//   2. Code tường minh, dễ giải thích thuật toán khi bảo vệ đồ án
//   3. Không cần import thêm package
// Nếu sàn scale lên hàng nghìn cặp, chỉ cần thay bằng sort.Slice.
// ============================================================

// sortByChange sắp xếp slice pairSummary theo % thay đổi 24h.
// desc = true  → tăng dần từ cao nhất (Top Gainers)
// desc = false → giảm dần từ thấp nhất (Top Losers)
func sortByChange(s []pairSummary, desc bool) {
	for i := 0; i < len(s); i++ {
		for j := i + 1; j < len(s); j++ {
			shouldSwap := false
			if desc {
				shouldSwap = s[j].Change24h > s[i].Change24h
			} else {
				shouldSwap = s[j].Change24h < s[i].Change24h
			}
			if shouldSwap {
				s[i], s[j] = s[j], s[i]
			}
		}
	}
}

// sortByVolume sắp xếp slice pairSummary theo volume 24h giảm dần.
// Cặp có volume lớn nhất (sôi động nhất) đứng đầu danh sách.
func sortByVolume(s []pairSummary) {
	for i := 0; i < len(s); i++ {
		for j := i + 1; j < len(s); j++ {
			if s[j].Volume24h > s[i].Volume24h {
				s[i], s[j] = s[j], s[i]
			}
		}
	}
}
