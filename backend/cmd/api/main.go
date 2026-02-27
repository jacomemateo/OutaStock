package main

import (
	"github.com/jacomemateo/OutaStock/backend/internal/transport"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
)

func main() {
	db := service.Database{}
	db.Connect()

	router := transport.Router{}
	router.Init(&db)
	router.Start()

	db.Close()
}
