package main

import (
	"github.com/jacomemateo/OutaStock/backend/internal/transport"
)

func main() {
	router := transport.Router{}
	router.Init()
	router.Start()
}
