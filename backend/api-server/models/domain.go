package models

import "time"

// 1. BANG NGUOI DUNG
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"` // Se bi bam (ma hoa) bang bang bcrypt
	FullName  string    `gorm:"not null" json:"full_name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Moi quan he: 1 User co nhieu Wallet va nhieu Orders
	Wallets []Wallet `gorm:"foreignKey:UserID"`
	Orders  []Order  `gorm:"foreignKey:UserID"`
}

// 2. BANG VI TIEN
type Wallet struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	UserID        uint    `gorm:"index;not null" json:"user_id"`
	Asset         string  `gorm:"type:varchar(10);not null" json:"asset"`            // VD: "USDT", "BTC"
	Balance       float64 `gorm:"type:decimal(18,8);default:0" json:"balance"`        // So du co the xai
	LockedBalance float64 `gorm:"type:decimal(18,8);default:0" json:"locked_balance"` // So du bi khoa dang doi lenh
}

// 3. BANG LENH GIAO DICH (ORDER)
type Order struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Symbol    string    `gorm:"type:varchar(20);not null" json:"symbol"`                  // vd: "btc_usdt"
	Side      string    `gorm:"type:enum('BUY','SELL');not null" json:"side"`             // mua hoac ban
	Type      string    `gorm:"type:enum('LIMIT','MARKET');not null" json:"type"`         // lenh gioi han / lenh cho
	Price     float64   `gorm:"type:decimal(18,8);not null" json:"price"`
	Quantity  float64   `gorm:"type:decimal(18,8);not null" json:"quantity"`
	Filled    float64   `gorm:"type:decimal(18,8);default:0" json:"filled"`                // so luong da khop
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
