const dialogFlow = require('dialogflow');
const uuid = require('node-uuid');
const TelegramBot = require('node-telegram-bot-api');
const structjson = require('./structjson');
const cLog = '[CLIENT] ';

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
        console.log(`${cLog}TelegramWebHook: ${baseUrl}/${aiConfig.clientWebHook}`);
        this._bot
            .setWebHook(`${baseUrl}/${aiConfig.clientWebHook}`)
            .catch(err => {
                console.error(`${cLog}ERROR: ${err}`);
            });

        console.log("Has open webhook: "+this._bot.hasOpenWebHook());

        this._sessionClient = new dialogFlow.SessionsClient({
           keyFileName: aiConfig.googleAppCreds
        });
        this._sessionIds = new Map();
    }

    processMessage(req, res) {
        let devConfig = this._aiConfig.devConfig;

        let updateObject = req.body;
        let react = req.body.react;
        if (devConfig) {
            console.log(`${cLog}body\n${JSON.stringify(updateObject, null, '   ')}`);
            console.log(`${cLog}react\n${react}`);
        }

        if (updateObject && updateObject.message) {
            let msg = updateObject.message;

            let chatId;

            if (req.sessionID && react == 'true') {
                chatId = req.sessionID;
            } else if (react != 'true'){
                chatId = msg.chat.id;
            }

            let messageText = msg.text;
            if (devConfig) console.log(`${cLog}chatId: ${chatId}, messageText: ${messageText}`);

            let promise;

            if (chatId && messageText) {
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }
                let sessionId = this.sessionIds.get(chatId);
                if (devConfig) console.log(`${cLog}sessionId: ${sessionId}`);

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);
                if (devConfig) console.log(`${cLog}sessionPath: ${sessionPath}`);

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
                        if (react == 'true'){
                            req.session.messages.push({who: 'me', what: 'markdown', message: messageText, outputs: null});
                        }
                    }
                        break;
                }
                processRequest(DialogFlow, promise, devConfig, this.bot, chatId, req, res, react);
            } else if(chatId){
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }
                let sessionId = this.sessionIds.get(chatId);
                if (devConfig) console.log(`${cLog}sessionId: ${sessionId}`);

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);
                if (devConfig) console.log(`${cLog}sessionPath: ${sessionPath}`);

                console.log(`${cLog}Empty message text`);
                let messageDoc = msg.document;
                if(messageDoc && chatId && messageDoc.file_id){
                    this.bot.getFileLink(messageDoc.file_id)
                        .then(result => {
                            let event = {
                                name: "DATA_RECEIVED",
                                parameters: structjson.jsonToStructProto({
                                    file_name: messageDoc.file_name,
                                    file_link: result
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
                            processRequest(DialogFlow, promise, devConfig, this._bot, chatId, req, res, react);
                        });
                } else if (messageDoc && chatId && messageDoc.file_name && messageDoc.file_link){
                    let event = {
                        name: "DATA_RECEIVED",
                        parameters: structjson.jsonToStructProto({
                            file_name: messageDoc.file_name,
                            file_link: messageDoc.file_link
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
                    processRequest(DialogFlow, promise, devConfig, this._bot, chatId, req, res, react);
                }
            }
        } else {
            console.log(`${cLog}Empty message`);
            return DialogFlow.createResponse(res, 400, 'Empty message');
        }
    }

    static createResponse(resp, statusCode, message, outputs = null, code = null) {
        /**
         * Json structure
         * {
         *    who: 'bot',
         *    message: message,
         *    outputs: {
         *      // o image/png o text/plain se codice o null se vuoto
         *      type: null,
         *      content: null
         *    },
         *    code: null
         * }
         */
        return resp.status(statusCode).json({
            who: 'bot',
            message: message,
            outputs: outputs,
            code: code
        });
    }
};

let processRequest = function (DialogFlow, promise, devConfig, bot, chatId, req, res, react){
    promise
        .then(responses => {
            let response = responses[0];
            if (devConfig) console.log(`${cLog}Response:\n${JSON.stringify(response, null, '   ')}`);
            if(response.queryResult) {
                let responseText = response.queryResult.fulfillmentText;
                let messages = response.queryResult.fulfillmentMessages;
                let webhookStatus = response.webhookStatus;

                if (responseText) {
                    if (devConfig) console.log(`${cLog}Response as text message with message: ${responseText}`);
                    if (react != 'true') {
                        bot.sendMessage(chatId, responseText, {parse_mode: 'html'})
                            .catch(err => {
                                console.error(`${cLog}ERROR: ${err}`);
                            });
                    }
                    console.log(`${cLog}FulfillmentText processed`);
                    if (messages && messages.length > 0 && webhookStatus !== null) {
                        if (devConfig) console.log(`${cLog}Response as multiple textMessages with messages: ${JSON.stringify(messages, null, '   ')}`);
                        messages.forEach((el, i) => {
                            let text = el.text.text[0];

                            if(text && text !== '' && text !== responseText) {
                                if (react != 'true') {
                                    bot.sendMessage(chatId, text, {parse_mode: 'html'})
                                        .catch(err => {
                                            console.error(`${cLog}ERROR: ${err}`);
                                        });
                                }
                                messages[i] = {
                                    type: 'text/plain',
                                    content: text
                                };
                            } else {
                                messages.splice(i,1);
                            }

                        });
                        if (devConfig) console.log(`${cLog}Outputs:\n${JSON.stringify(messages, null, '   ')}`);
                        console.log(`${cLog}FulfillmentMessages processed`);
                    } else if (messages.lenght = 0 || webhookStatus === null){
                        messages = null;
                    }
                    if (react == 'true') {
                        req.session.messages.push({who: 'bot', what: 'markdown', message: responseText, outputs: messages});
                    }
                    DialogFlow.createResponse(res, 200, responseText, messages)
                } else {
                    if (react != 'true') {
                        bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes')
                            .catch(err => {
                                console.error(`${cLog}ERROR: ${err}`);
                            });
                    }
                    console.log(`${cLog}Received empty speech`);
                    let message = 'Something went wrong. Please retry in a few minutes';
                    if (react == 'true') {
                        req.session.messages.push({who: 'bot', what: 'markdown', message: message, outputs: null});
                    }
                    DialogFlow.createResponse(res, 400, message);
                }

            } else {
                if (react != 'true') {
                    bot.sendMessage(chatId, 'Something went wrong. Please retry in a few minutes')
                        .catch(err => {
                            console.error(`${cLog}ERROR: ${err}`);
                        });
                }
                console.log(`${cLog}Received empty result`);
                let message = 'Something went wrong. Please retry in a few minutes';
                if (react == 'true') {
                    req.session.messages.push({who: 'bot', what: 'markdown', message: message, outputs: null});
                }
                DialogFlow.createResponse(res, 400, message);
            }
        })
        .catch(err => {
            console.error(`${cLog}Error while call to dialogFlow`, err);
            let message = 'Error while call to dialogFlow';
            if (react == 'true') {
                req.session.messages.push({who: 'bot', what: 'markdown', message: message, outputs: null});
            }
            DialogFlow.createResponse(res, 400, message);
        });
};

