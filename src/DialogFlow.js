const dialogFlow = require('dialogflow');
//const structjson = require('./structjson.js');
const uuid = require('node-uuid');
const TelegramBot = require('node-telegram-bot-api');
const structjson = require('./structjson.js');

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
        if (devConfig) console.log(`body\n${JSON.stringify(req.body, null, '   ')}`);

        let updateObject = req.body;

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

                if (devConfig) console.log('Empty message text');
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
            if (devConfig) console.log('Empty message');
            return DialogFlow.createResponse(res, 200, 'Empty message');
        }
    }

    static createResponse(resp, code, message) {
        return resp.status(code).json({
            status: {
                code: code,
                message: message
            }
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

                if (devConfig) console.log(`Result:\n${JSON.stringify(response.queryResult, null, '   ')}`);

                if (responseText) {
                    if (devConfig) console.log(`Response as text message with message: ${responseText}`);
                    bot.sendMessage(chatId, responseText, {parse_mode: 'html'});
                    DialogFlow.createResponse(res, 200, 'Message processed');
                } else if (messages && messages.length > 0) {
                    if (devConfig) console.log(`Response as multiple textMessages with messages: ${JSON.stringify(messages, null, '   ')}`);
                    messages.forEach(el => {
                        let text = el.text.text[0];
                        if(text && text !== '') {
                            bot.sendMessage(chatId, text, {parse_mode: 'html'});
                        }
                    });

                    DialogFlow.createResponse(res, 200, 'Message processed');
                } else {
                    if (devConfig) console.log('Received empty speech');
                    bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes');
                    DialogFlow.createResponse(res, 200, 'Received empty speech');
                }
            } else {
                if (devConfig) console.log('Received empty result');
                bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes');
                DialogFlow.createResponse(res, 200, 'Received empty result');
            }
        })
        .catch(err => {
            console.error('Error while call to dialogFlow', err);
            DialogFlow.createResponse(res, 200, 'Error while call to dialogFlow');
        })
};

