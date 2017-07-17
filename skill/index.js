'use strict';
const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const appId = 'amzn1.ask.skill.3a7252e6-5924-45b6-b816-18d61c2f2cd0';
const iotEndpoint = 'apn2stdwvjd9h.iot.eu-west-1.amazonaws.com';

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

function Publish(topic = 'defaulttopic', command, cb) {
    var iotdata = new AWS.IotData({ endpoint: iotEndpoint });    
    var params = {
        topic: topic,
        payload: command,
        qos: 0
    };

    iotdata.publish(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            return cb;
        }
    });
}

const handlers = {
    //called when you dont ask the command to do anything
    LaunchRequest: function () {
        this.emit(':tell', this.t('ERROR_COMMAND_TO'));
    },
    //called when `ask "my computer" "to"` is said
    logIntent: function () {

        const self = this;
        Publish('topic', 'log off', function () {
            self.emit(':tell', this.t('OK'));
        });
    },
    Unhandled: function () {
        this.emit(':tell', this.t('ERROR_COMMAND_TO'));
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = appId;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};