package config

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8" // Chú ý: phải gõ lệnh: go get github.com/go-redis/redis/v8
	"gorm.io/driver/mysql"         // Chú ý: phải gõ lệnh: go get gorm.io/driver/mysql
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	DB          *gorm.DB
	RedisClient *redis.Client
	Ctx         = context.Background()
)

func ConnectDB() {
	// Móc vào thẳng con Docker ở cổng 3310. Database tên là cryptoex, pass là root
	dsn := "root:root@tcp(127.0.0.1:3310)/cryptoex?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf(" Lỗi kết nối MySQL (Cổng 3310): %v", err)
	}

	DB = db
	fmt.Println(" Đã kết nối thành công tới MySQL (Docker Cổng 3310)!")
}

func ConnectRedis() {
	// Móc vào con Redis trong Docker ở cổng 6379
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "127.0.0.1:6379",
		Password: "", // Docker không pass
		DB:       0,
	})

	if _, err := RedisClient.Ping(Ctx).Result(); err != nil {
		log.Fatalf(" Lỗi kết nối tới Redis: %v", err)
	}

	fmt.Println(" Đã kết nối TCP tới Redis Docker!")
}
