package ws

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// upgrader dung de nang cap ket noi http len websocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // cho phep moi nguon dang ky (cors)
	},
}

// quan ly danh sach cac ket noi websocket dang co
var clients = make(map[*websocket.Conn]bool)
var clientsMutex sync.Mutex

// handlewebsocket xu ly ket noi websocket den tu frontend
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("loi khi nang cap ws: %v\n", err)
		return
	}
	defer conn.Close()

	// dang ky client moi
	clientsMutex.Lock()
	clients[conn] = true
	clientsMutex.Unlock()

	// lang nghe tin nhan tu client (trong do an nay chu yeu la server gui cho client)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			clientsMutex.Lock()
			delete(clients, conn)
			clientsMutex.Unlock()
			break
		}
	}
}

// broadcastmarketdata gui thong tin thi truong cho tat ca client dang ket noi
func BroadcastMarketData(data interface{}) {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	for client := range clients {
		err := client.WriteJSON(data)
		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}
