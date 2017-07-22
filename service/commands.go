package service

import (
	"errors"
	"log"
)

var (
	commands = map[string]func() error{
		"log off": logOff,
	}
)

//DoCommand does the OS Specific action as requested through mqtt
func DoCommand(cmd string) error {
	if fn, ok := commands[cmd]; ok {
		return fn()
	}
	return errors.New("invalid command")
}

func logOff() error {
	log.Println("Log off please")
	return nil
}
