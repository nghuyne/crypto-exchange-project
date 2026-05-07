package config

import (
	"context"
	"fmt"
	"log"
	"os"

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
	mysqlHost := getEnv("MYSQL_HOST", "127.0.0.1")
	mysqlPort := getEnv("MYSQL_PORT", "3310")
	mysqlUser := getEnv("MYSQL_USER", "root")
	mysqlPassword := getEnv("MYSQL_PASSWORD", "root")
	mysqlDatabase := getEnv("MYSQL_DB", "cryptoex")
	rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local", mysqlUser, mysqlPassword, mysqlHost, mysqlPort)
	targetDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", mysqlUser, mysqlPassword, mysqlHost, mysqlPort, mysqlDatabase)

	bootstrapDB, err := gorm.Open(mysql.Open(rootDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf(" Lỗi kết nối MySQL (%s:%s): %v", mysqlHost, mysqlPort, err)
	}

	if err := bootstrapDB.Exec("CREATE DATABASE IF NOT EXISTS `" + mysqlDatabase + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci").Error; err != nil {
		log.Fatalf(" Không thể tạo MySQL database %s: %v", mysqlDatabase, err)
	}

	db, err := gorm.Open(mysql.Open(targetDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf(" Lỗi kết nối MySQL (%s:%s): %v", mysqlHost, mysqlPort, err)
	}

	DB = db
	fmt.Printf(" Đã kết nối thành công tới MySQL (%s:%s)!\n", mysqlHost, mysqlPort)
}

func ConnectRedis() {
	redisHost := getEnv("REDIS_HOST", "127.0.0.1")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     redisHost + ":" + redisPort,
		Password: redisPassword,
		DB:       0,
	})

	if _, err := RedisClient.Ping(Ctx).Result(); err != nil {
		log.Printf(" Cảnh báo: không kết nối được Redis (%s:%s): %v", redisHost, redisPort, err)
		RedisClient = nil
		return
	}

	fmt.Printf(" Đã kết nối thành công tới Redis (%s:%s)!\n", redisHost, redisPort)
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
