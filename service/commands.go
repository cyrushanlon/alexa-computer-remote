package service

import (
	"errors"
	"log"
	"os/exec"
)

var (
	commands = map[string]func() error{
		"log off":   logOff,
		"shut down": shutDown,
		"lock":      lock,
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

func shutDown() error {
	log.Println("Shut down please")
	return nil
}

func lock() error {
	//log.Println("lock please")

	//probably not a very good method when there is a win api call available (i think)
	//but it works for now
	cmd := exec.Command("rundll32.exe", "user32.dll,LockWorkStation")
	err := cmd.Start()
	if err != nil {
		return err
	}

	return nil
}
