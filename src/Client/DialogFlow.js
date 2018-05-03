const dialogFlow = require('dialogflow');
//const structjson = require('./structjson.js');
const uuid = require('node-uuid');
const TelegramBot = require('node-telegram-bot-api');
const structjson = require('./structjson');

module.exports = class DialogFlow {
    get sessionClient() {
        return this._sessionClient;
    }

    set sessionClient(value) {
        this._sessionClient = value;
    }

    get bot() {
        return this._bot;
    }

    set bot(value) {
        this._bot = value;
    }

    get aiConfig() {
        return this._aiConfig;
    }

    set aiConfig(value) {
        this._aiConfig = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(aiConfig, baseUrl) {
        this._aiConfig = aiConfig;

        this._bot = new TelegramBot(aiConfig.telegramToken);
        this._bot
            .setWebHook(`${baseUrl}/${aiConfig.clientWebHook}`)
            .catch(err => {
                console.error(`ERROR: ${err}`);
            });

        this._sessionClient = new dialogFlow.SessionsClient({
           keyFileName: aiConfig.googleAppCreds
        });
        this._sessionIds = new Map();
    }

    processMessage(req, res) {
        let devConfig = this._aiConfig.devConfig;

        let updateObject = req.body;
        if (devConfig) {
            console.log(`body\n${JSON.stringify(updateObject, null, '   ')}`);
            console.log(`body not parsed\n${updateObject}`);
            console.log(`header1\n${JSON.stringify(req.header, null, '   ')}`);
        }

        if (updateObject && updateObject.message) {
            let msg = updateObject.message;

            let chatId;

            if (msg.chat) {
                chatId = msg.chat.id;
            }

            let messageText = msg.text;
            if (devConfig) console.log(`chatId: ${chatId}, messageText: ${messageText}`);

            let promise;

            if (chatId && messageText) {
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }
                let sessionId = this.sessionIds.get(chatId);
                if (devConfig) console.log(`sessionId: ${sessionId}`);

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);
                if (devConfig) console.log(`sessionPath: ${sessionPath}`);

                switch(messageText) {
                    case "/start": {
                        let event = {
                            name: "TELEGRAM_WELCOME",
                            languageCode: this.aiConfig.languageCode,
                        };
                        let request = {
                            session: sessionPath,
                            queryInput: {
                                event: event
                            }
                        };
                        promise = this.sessionClient.detectIntent(request);
                    }
                        break;
                    default: {
                        let text = {
                            text: messageText,
                            languageCode: this.aiConfig.languageCode
                        };
                        let request = {
                            session: sessionPath,
                            queryInput: {
                                text: text
                            }
                        };
                        promise = this.sessionClient.detectIntent(request);
                    }
                        break;
                }

                processRequest(DialogFlow, promise, devConfig, this.bot, chatId, res);
            } else if(chatId){
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }
                let sessionId = this.sessionIds.get(chatId);
                if (devConfig) console.log(`sessionId: ${sessionId}`);

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);
                if (devConfig) console.log(`sessionPath: ${sessionPath}`);

                console.log('Empty message text');
                let messageDoc = msg.document;
                if(messageDoc && chatId && messageDoc.file_id){
                    this.bot.getFileLink(messageDoc.file_id)
                        .then(result => {
                            let fileLink = result;
                            let event = {
                                name: "DATA_RECEIVED",
                                parameters: structjson.jsonToStructProto({
                                    file_name: messageDoc.file_name,
                                    file_link: fileLink
                                }),
                                languageCode: this.aiConfig.languageCode,
                            };
                            let request = {
                                session: sessionPath,
                                queryInput: {
                                    event: event
                                }
                            };
                            promise = this.sessionClient.detectIntent(request);
                            processRequest(DialogFlow, promise, devConfig, this._bot, chatId, res);
                        });
                }
            }
        } else {
            console.log('Empty message');
            return DialogFlow.createResponse(res, 400, 'Empty message');
        }
    }

    static createResponse(resp, statusCode, message, outType, outContent, code) {
        return resp.status(statusCode).json({
            who: 'bot',
            message: message,
            output: {
                // o image/png o text/plain se codice o null se vuoto
                type: null,
                content: null
            },
            code: null
        });
    }
};

let processRequest = function (DialogFlow, promise, devConfig, bot, chatId, res){
    promise
        .then(responses => {
            let response = responses[0];
            if (devConfig) console.log(`Response:\n${JSON.stringify(response, null, '   ')}`);
            if(response.queryResult) {
                let responseText = response.queryResult.fulfillmentText;
                let messages = response.queryResult.fulfillmentMessages;

                if (responseText) {
                    if (devConfig) console.log(`Response as text message with message: ${responseText}`);
                    bot.sendMessage(chatId, responseText, {parse_mode: 'html'});
                    console.log('Message processed');
                    DialogFlow.createResponse(res, 200, responseText);
                } else if (messages && messages.length > 0) {
                    if (devConfig) console.log(`Response as multiple textMessages with messages: ${JSON.stringify(messages, null, '   ')}`);
                    messages.forEach(el => {
                        let text = el.text.text[0];
                        if(text && text !== '') {
                            bot.sendMessage(chatId, text, {parse_mode: 'html'});
                        }
                    });
                    console.log('Message processed');
                    DialogFlow.createResponse(res, 200, text);
                } else {
                    bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes');
                    console.log('Received empty speech');
                    DialogFlow.createResponse(res, 200, 'Something went wrong. Please retry in a few minutes');
                }
            } else {
                bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes');
                console.log('Received empty result');
                DialogFlow.createResponse(res, 200, 'Something went wrong. Please retry in a few minutes');
            }
        })
        .catch(err => {
            console.error('Error while call to dialogFlow', err);
            DialogFlow.createResponse(res, 400, 'Error while call to dialogFlow');
        })
};

