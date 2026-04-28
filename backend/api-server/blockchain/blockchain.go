package blockchain

import (
	"encoding/gob"
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

const dbFile = "blockchain_audit.db"

type Blockchain struct {
	Blocks []*Block
	mu     sync.RWMutex
}

// NewBlockchain khởi tạo chuỗi kiểm toán cho sàn
func NewBlockchain() *Blockchain {
	bc := &Blockchain{}
	if bc.load() != nil {
		fmt.Println("🚀 Khởi tạo Chuỗi Kiểm toán AI (Genesis)...")
		bc.Blocks = []*Block{NewGenesisBlock()}
		bc.save()
	} else {
		fmt.Printf("✅ Đã kết nối Chuỗi Kiểm toán AI (%d blocks)\n", len(bc.Blocks))
	}
	return bc
}

// AddAuditRecord thêm một bản ghi kiểm toán AI vào Blockchain
func (bc *Blockchain) AddAuditRecord(metadata string) {
	bc.mu.Lock()
	defer bc.mu.Unlock()

	prevBlock := bc.Blocks[len(bc.Blocks)-1]
	tx := &Transaction{
		ID:   []byte(fmt.Sprintf("%d", time.Now().UnixNano())),
		Data: metadata,
	}
	newBlock := NewBlock([]*Transaction{tx}, prevBlock.Hash, len(bc.Blocks))
	bc.Blocks = append(bc.Blocks, newBlock)
	
	bc.save()
	log.Printf("⛓️ AUDIT LOG: Block #%d added to Blockchain Audit Trail", newBlock.Index)
}

func (bc *Blockchain) save() error {
	file, err := os.Create(dbFile)
	if err != nil {
		return err
	}
	defer file.Close()
	return gob.NewEncoder(file).Encode(bc.Blocks)
}

func (bc *Blockchain) load() error {
	file, err := os.Open(dbFile)
	if err != nil {
		return err
	}
	defer file.Close()
	return gob.NewDecoder(file).Decode(&bc.Blocks)
}

// Validate kiểm tra tính toàn vẹn của chuỗi audit
func (bc *Blockchain) Validate() bool {
	for i := 1; i < len(bc.Blocks); i++ {
		if string(bc.Blocks[i].calculateHash()) != string(bc.Blocks[i].Hash) {
			return false
		}
		if string(bc.Blocks[i].PrevBlockHash) != string(bc.Blocks[i-1].Hash) {
			return false
		}
	}
	return true
}
