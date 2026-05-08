package models

import "time"

// 1. BANG NGUOI DUNG
type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Email         string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password      string    `gorm:"not null" json:"-"` // Se bi bam (ma hoa) bang bang bcrypt
	FullName      string    `gorm:"not null" json:"full_name"`
	Role          string    `gorm:"type:varchar(20);default:'USER'" json:"role"`          // USER, ADMIN, MODERATOR
	Status        string    `gorm:"type:varchar(20);default:'ACTIVE'" json:"status"`      // ACTIVE, SUSPENDED, BANNED
	KYCStatus     string    `gorm:"type:varchar(20);default:'PENDING'" json:"kyc_status"` // PENDING, VERIFIED, REJECTED
	Tier          int       `gorm:"default:1" json:"tier"`                                // 1=beginner, 2=advanced, 3=pro
	FaucetClaimed bool      `gorm:"default:false" json:"faucet_claimed"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Moi quan he: 1 User co nhieu Wallet va nhieu Orders
	Wallets []Wallet `gorm:"foreignKey:UserID"`
	Orders  []Order  `gorm:"foreignKey:UserID"`
}

// 2. BANG VI TIEN
type Wallet struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	UserID        uint    `gorm:"index;not null" json:"user_id"`
	Asset         string  `gorm:"type:varchar(10);not null" json:"asset"`             // VD: "USDT", "BTC"
	Balance       float64 `gorm:"type:decimal(18,8);default:0" json:"balance"`        // So du co the xai
	LockedBalance float64 `gorm:"type:decimal(18,8);default:0" json:"locked_balance"` // So du bi khoa dang doi lenh
}

// 3. BANG LENH GIAO DICH (ORDER)
type Order struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Symbol    string    `gorm:"type:varchar(20);not null" json:"symbol"`          // vd: "btc_usdt"
	Side      string    `gorm:"type:enum('BUY','SELL');not null" json:"side"`     // mua hoac ban
	Type      string    `gorm:"type:enum('LIMIT','MARKET');not null" json:"type"` // lenh gioi han / lenh cho
	Price     float64   `gorm:"type:decimal(18,8);not null" json:"price"`
	Quantity  float64   `gorm:"type:decimal(18,8);not null" json:"quantity"`
	Filled    float64   `gorm:"type:decimal(18,8);default:0" json:"filled"` // so luong da khop
	Status    string    `gorm:"type:enum('OPEN','FILLED','PARTIAL','CANCELLED');default:'OPEN'" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// 4. BANG LICH SU KHOP LENH (TRADE)
type Trade struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	BuyOrderID  uint      `gorm:"index;not null" json:"buy_order_id"`
	SellOrderID uint      `gorm:"index;not null" json:"sell_order_id"`
	Symbol      string    `gorm:"type:varchar(20);not null" json:"symbol"`
	Price       float64   `gorm:"type:decimal(18,8);not null" json:"price"`
	Quantity    float64   `gorm:"type:decimal(18,8);not null" json:"quantity"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// 5. BANG GHI LOG ADMIN
type AdminLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AdminID   uint      `gorm:"index;not null" json:"admin_id"`
	Action    string    `gorm:"type:varchar(100);not null" json:"action"` // SUSPEND_USER, RESUME_USER, CANCEL_ORDER, ADJUST_FEE
	TargetID  uint      `gorm:"index" json:"target_id"`                   // user_id hoac order_id
	Details   string    `gorm:"type:text" json:"details"`                 // JSON details
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// 6. CAU HINH HE THONG (FEE, LIMITS, ETC)
type SystemConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ConfigKey string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"config_key"` // TAKER_FEE, MAKER_FEE, WITHDRAWAL_FEE
	Value     string    `gorm:"type:varchar(255);not null" json:"value"`                  // "0.001" or "100000"
	UpdatedBy uint      `gorm:"index" json:"updated_by"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
