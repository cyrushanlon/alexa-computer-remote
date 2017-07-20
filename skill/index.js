'use strict';
const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');

//const appId = 'amzn1.ask.skill.39656857-2dbe-4b03-ace9-1ac47874c7d3';
var iotdata = new AWS.IotData({ endpoint: 'apn2stdwvjd9h.iot.eu-west-1.amazonaws.com' });    

const languageStrings = {
    'en': {
        translation: {
            OK                          : 'Command sent.',
            ERROR_COMMAND_TO            : 'The command was structured wrong. Sorry!',
            ERROR_COMMAND_FAILED        : 'The command failed to be sent. Sorry!',
            ERROR_COMMAND_INVALID       : 'That command is not supported. Sorry!',
        }
    }
};

function mqttPublish(topic, command, cb) {

    var params = {
        topic: 'topic',
        payload: new Buffer('log off') || 'STRING_VALUE',
        qos: 0
    };

    iotdata.publish(params, function(err, data) {
        if (err) 
            console.log(err);
        else {     
            cb(err, data);
        }
    });
}

const handlers = {
    //called when you dont ask the command to do anything
    LaunchRequest: function () {
        this.emit(':tell', this.t('ERROR_COMMAND_TO'));
    },
    //called when `ask "my computer" to "log off"` is said
    logIntent: function () {

        var self = this
        mqttPublish('topic', 'log off', function(err, data) {
            if (err)
                self.emit(':tell', self.t('ERROR_COMMAND_FAILED'));
            else
                self.emit(':tell', self.t('OK'));
        });  

    },
    Unhandled: function () {
        this.emit(':tell', this.t('ERROR_COMMAND_TO'));
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
//    alexa.appId = appId;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};