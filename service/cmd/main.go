package main

import (
	"crypto/tls"
	"time"

	"log"

	"../../service" // fix

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	//"github.com/cyrushanlon/alexa-computer-remove/service"
	"github.com/eclipse/paho.mqtt.golang"
)

//Call platform specific shutdown or w/e command

var (
	client mqtt.Client
	region = "eu-west-1"
	sess   *session.Session
)

//CreateAWSSession returns an AWS session with the .env file credentials for the specified region
func createAWSSession(region string) *session.Session {
	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String(region),
	}))

	return sess
}

func sendMQTTMessage(topic string, msg string) {

	token := client.Publish(topic, 0, false, msg)
	token.Wait()
	//log.Info("Sent", msg)
}

//define a function for the default message handler
var f mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
	err := service.DoCommand(string(msg.Payload()))
	if err != nil {
		log.Println(err)
	}
}

func serviceInit() error {
	// Create an AWS Session with a custom region
	sess = createAWSSession(region)

	//load the certs from next to main.go
	cer, err := tls.LoadX509KeyPair("0a7cd9556a-certificate.pem.crt", "0a7cd9556a-private.pem.key") //need to change this
	if err != nil {
		return err
	}

	//Create and configure the mqtt client
	connOpts := mqtt.NewClientOptions()
	connOpts.SetClientID("myComputer" + time.Now().String())
	connOpts.SetCleanSession(true)
	connOpts.SetAutoReconnect(true)
	connOpts.SetMaxReconnectInterval(1 * time.Second)
	connOpts.SetKeepAlive(30 * time.Second)
	connOpts.SetTLSConfig(&tls.Config{Certificates: []tls.Certificate{cer}})

	connOpts.AddBroker("tcps://apn2stdwvjd9h.iot.eu-west-1.amazonaws.com:8883/mqtt")
	connOpts.SetDefaultPublishHandler(f)

	client = mqtt.NewClient(connOpts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		return token.Error()
	}

	//at a maximum qos of zero, wait for the receipt to confirm the subscription
	if token := client.Subscribe("topic", 0, nil); token.Wait() && token.Error() != nil {
		return token.Error()
	}

	return nil
}

func main() {

	err := serviceInit()
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("Ready")

	for {
		time.Sleep(time.Second)
	}
}
