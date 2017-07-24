'use strict';
const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');

var iotdata = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT });    

const languageStrings = {
    'en': {
        translation: {
            OK                          : 'Okay. ',
            ERROR_COMMAND_TO            : 'What about it?',
            ERROR_COMMAND_FAILED        : 'The command failed to be sent. Sorry!',
            ERROR_COMMAND_INVALID       : 'That command is not supported. Sorry!',

            GO_AWAY                     : 'Wrong Password.',

            LOGGING_OFF                 : 'Logging off.',
            SHUTTING_DOWN               : 'Shutting down.',
            LOCKING                     : 'Loc-ing.' //spelling is because she says locking very strangely
        }
    }
};

function mqttPublish(topic, command, cb) {

    var params = {
        topic: topic,
        payload: new Buffer(command) || 'STRING_VALUE',
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

        var self = this;
        mqttPublish('topic', 'log off', function(err, data) {
            if (err)
                self.emit(':tell', self.t('ERROR_COMMAND_FAILED'));
            else
                self.emit(':tell', self.t('OK') + self.t('LOGGING_OFF'));
        });  

    },
    //called when `ask "my computer" to "shut down"` is said
    shutIntent: function () {

        var self = this;
        mqttPublish('topic', 'shut down', function(err, data) {
            if (err)
                self.emit(':tell', self.t('ERROR_COMMAND_FAILED'));
            else
                self.emit(':tell', self.t('OK') + self.t('SHUTTING_DOWN'));
        });  

    },
    //called when `ask "my computer" to "lock"` is said
    lockIntent: function () {

        var self = this;
        mqttPublish('topic', 'lock', function(err, data) {
            if (err)
                self.emit(':tell', self.t('ERROR_COMMAND_FAILED'));
            else
                self.emit(':tell', self.t('OK') + self.t('LOCKING'));
        });  

    },
    Unhandled: function () {
        this.emit(':tell', this.t('ERROR_COMMAND_TO'));
    }
};

exports.handler = function (event, context) {

    //these are so I can use the service testing thing rather than speaking to the device every time
    event.context.System.application.applicationId = event.session.application.applicationId;
    event.context.System.user.userId = event.session.user.userId;

    const alexa = Alexa.handler(event, context);

    alexa.appId = process.env.APP_ID;

    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};