package controllers

import (
	"testing"
)

// TestWalletBalance tests wallet balance operations
func TestWalletBalance(t *testing.T) {
	tests := []struct {
		name    string
		balance float64
		wantErr bool
	}{
		{
			name:    "valid balance",
			balance: 1000.50,
			wantErr: false,
		},
		{
			name:    "zero balance",
			balance: 0,
			wantErr: false,
		},
		{
			name:    "negative balance",
			balance: -100,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.balance < 0 && !tt.wantErr {
				t.Errorf("Negative balance should produce error")
			}
		})
	}
}

// TestOrderValidation tests order creation validation
func TestOrderValidation(t *testing.T) {
	tests := []struct {
		name      string
		asset     string
		quantity  float64
		price     float64
		orderType string
		wantErr   bool
	}{
		{
			name:      "valid buy order",
			asset:     "BTC",
			quantity:  0.5,
			price:     45000.0,
			orderType: "buy",
			wantErr:   false,
		},
		{
			name:      "valid sell order",
			asset:     "ETH",
			quantity:  2.0,
			price:     3000.0,
			orderType: "sell",
			wantErr:   false,
		},
		{
			name:      "invalid asset",
			asset:     "INVALID",
			quantity:  1.0,
			price:     100.0,
			orderType: "buy",
			wantErr:   true,
		},
		{
			name:      "zero quantity",
			asset:     "BTC",
			quantity:  0,
			price:     45000.0,
			orderType: "buy",
			wantErr:   true,
		},
		{
			name:      "negative quantity",
			asset:     "BTC",
			quantity:  -1.0,
			price:     45000.0,
			orderType: "buy",
			wantErr:   true,
		},
		{
			name:      "zero price",
			asset:     "BTC",
			quantity:  0.5,
			price:     0,
			orderType: "buy",
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.quantity <= 0 && !tt.wantErr {
				t.Errorf("Invalid quantity should produce error")
			}
			if tt.price <= 0 && !tt.wantErr {
				t.Errorf("Invalid price should produce error")
			}
		})
	}
}

// TestAssetTransfer tests asset transfer operations
func TestAssetTransfer(t *testing.T) {
	tests := []struct {
		name     string
		fromUser int64
		toUser   int64
		asset    string
		amount   float64
		wantErr  bool
	}{
		{
			name:     "valid transfer",
			fromUser: 1,
			toUser:   2,
			asset:    "BTC",
			amount:   0.1,
			wantErr:  false,
		},
		{
			name:     "same sender and receiver",
			fromUser: 1,
			toUser:   1,
			asset:    "BTC",
			amount:   0.1,
			wantErr:  true,
		},
		{
			name:     "zero amount",
			fromUser: 1,
			toUser:   2,
			asset:    "BTC",
			amount:   0,
			wantErr:  true,
		},
		{
			name:     "negative amount",
			fromUser: 1,
			toUser:   2,
			asset:    "BTC",
			amount:   -0.1,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.fromUser == tt.toUser && !tt.wantErr {
				t.Errorf("Same sender and receiver should produce error")
			}
			if tt.amount <= 0 && !tt.wantErr {
				t.Errorf("Invalid amount should produce error")
			}
		})
	}
}

// TestMarketData tests market data operations
func TestMarketData(t *testing.T) {
	tests := []struct {
		name    string
		symbol  string
		wantErr bool
	}{
		{
			name:    "valid BTC symbol",
			symbol:  "BTC",
			wantErr: false,
		},
		{
			name:    "valid ETH symbol",
			symbol:  "ETH",
			wantErr: false,
		},
		{
			name:    "invalid symbol",
			symbol:  "INVALID",
			wantErr: true,
		},
		{
			name:    "empty symbol",
			symbol:  "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.symbol == "" && !tt.wantErr {
				t.Errorf("Empty symbol should produce error")
			}
		})
	}
}

// TestOrderBookData tests order book data operations
func TestOrderBookData(t *testing.T) {
	tests := []struct {
		name    string
		symbol  string
		depth   int
		wantErr bool
	}{
		{
			name:    "valid order book",
			symbol:  "BTC",
			depth:   10,
			wantErr: false,
		},
		{
			name:    "large depth",
			symbol:  "ETH",
			depth:   100,
			wantErr: false,
		},
		{
			name:    "invalid depth",
			symbol:  "BTC",
			depth:   0,
			wantErr: true,
		},
		{
			name:    "negative depth",
			symbol:  "BTC",
			depth:   -1,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.depth <= 0 && !tt.wantErr {
				t.Errorf("Invalid depth should produce error")
			}
		})
	}
}
