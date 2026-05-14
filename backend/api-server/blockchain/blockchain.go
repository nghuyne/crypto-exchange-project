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
		fmt.Println("Khởi tạo Chuỗi Kiểm toán AI (Genesis)...")
		bc.Blocks = []*Block{NewGenesisBlock()}
		bc.save()
	} else {
		fmt.Printf("Đã kết nối Chuỗi Kiểm toán AI (%d blocks)\n", len(bc.Blocks))
	}
	return bc
}

// AddAuditRecord thêm một bản ghi kiểm toán AI vào Blockchain.
// Trả về error nếu persist thất bại để caller có thể log CRITICAL và quyết định flow.
// Tại sao phải trả error? Vì silent failure = audit trail giả tạo = mất bằng chứng compliance.
func (bc *Blockchain) AddAuditRecord(metadata string) error {
	bc.mu.Lock()
	defer bc.mu.Unlock()

	prevBlock := bc.Blocks[len(bc.Blocks)-1]
	tx := &Transaction{
		ID:   []byte(fmt.Sprintf("%d", time.Now().UnixNano())),
		Data: metadata,
	}
	newBlock := NewBlock([]*Transaction{tx}, prevBlock.Hash, len(bc.Blocks))
	bc.Blocks = append(bc.Blocks, newBlock)

	if err := bc.save(); err != nil {
		// Block đã được append vào memory nhưng CHƯA persist xuống disk.
		// Caller phải xử lý: log CRITICAL + quyết định có block request không.
		log.Printf("⛓️ [CRITICAL] Block #%d created in memory but failed to persist: %v", newBlock.Index, err)
		return err
	}
	log.Printf("⛓️ AUDIT LOG: Block #%d added to Blockchain Audit Trail", newBlock.Index)
	return nil
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
