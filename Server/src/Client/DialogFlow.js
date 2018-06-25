const dialogFlow = require('dialogflow');
const uuid = require('node-uuid');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const Common = require('../Common');

const structjson = require('./Methods/structjson');

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

    constructor(aiConfig, baseUrl) {
        this._aiConfig = aiConfig;
        if (baseUrl) {
            this._bot = new TelegramBot(aiConfig.telegramToken);
            if (aiConfig.devConfig) console.log(`${cLog}TelegramWebHook: ${baseUrl}/${aiConfig.clientWebHook}`);
            this._bot
                .setWebHook(`${baseUrl}/${aiConfig.clientWebHook}`)
                .catch(err => {
                    console.error(`${cLog}ERROR: ${err}`);
                });
        }
        this._sessionClient = new dialogFlow.SessionsClient({
           keyFileName: aiConfig.googleAppCreds
        });
    }

    processMessage(req, res) {
        let devConfig = this._aiConfig.devConfig;

        let updateObject = req.body;

        if (updateObject && updateObject.message) {
            let msg = updateObject.message;

            let react = updateObject.react;

            let sessionId;
            if (req.sessionID && react == 'true') {
                sessionId = req.sessionID;
            } else if (react != 'true'){
                sessionId = `${msg.chat.id}`;
            }

            let session = Common.sessions.get(sessionId);

            console.log('VARIABLE: '+updateObject.variabile);
            if (react == 'true' && updateObject.variabile != null)
                session.variable = updateObject.variabile;
            else if (react == 'true')
                return DialogFlow.createResponse(res, 400, 'Something went wrong. Either select a variable or upload one before asking again.');

            let messageText = msg.text;
            if (react !== 'true' && (messageText.startsWith('make') || messageText.startsWith('change'))){
                    messageText.append(' of chart1');
            }
            if (devConfig) console.log(`${cLog}chatId: ${sessionId}, messageText: ${messageText}`);

            let promise;

            if (sessionId && messageText) {

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);
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
                processRequest(DialogFlow, promise, this.aiConfig, this.bot, sessionId, req, res, react);
            } else if(sessionId){

                let sessionPath = this.sessionClient.sessionPath(this.aiConfig.projectId, sessionId);

                let messageDoc = msg.document;
                if(messageDoc && sessionId && messageDoc.file_id){
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
                            processRequest(DialogFlow, promise, this.aiConfig, this._bot, sessionId, req, res, react);
                        });
                } else if (messageDoc && sessionId && messageDoc.file_name && messageDoc.file_link){
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
                    processRequest(DialogFlow, promise, this.aiConfig, this._bot, sessionId, req, res, react);
                } else {
                    let message = `You haven't sent anything, what should I do?`;
                    console.log(`${cLog}Empty message`);
                    return DialogFlow.createResponse(res, 400, message);
                }
            }
        } else {
            console.log(`${cLog}Empty request`);
            return DialogFlow.createResponse(res, 400, 'Empty message');
        }
    }

    static createResponse(resp, statusCode, message, action = null, outputs = null, code = null, chartName = null) {
        /**
         * Json structure
         * {
         *    who: 'bot',
         *    action: test.request,
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
            action: action,
            message: message,
            outputs: outputs,
            chartName: chartName,
            code: code
        });
    }
};

let processRequest = function (DialogFlow, promise, aiConfig, bot, sessionId, req, res, react){
    promise
        .then(responses => {
            let response = responses[0];
            if(response.queryResult) {
                let responseText = response.queryResult.fulfillmentText;
                let action = response.queryResult.action;
                let messages = response.queryResult.fulfillmentMessages;
                let webhookStatus = response.webhookStatus;
                let webhookPayload = response.queryResult.webhookPayload;
                let codeToSend = webhookPayload && webhookPayload.fields && webhookPayload.fields.code ? webhookPayload.fields.code.stringValue : null;
                let image = webhookPayload && webhookPayload.fields && webhookPayload.fields.image ? webhookPayload.fields.image.stringValue : null;
                let chartName =  webhookPayload && webhookPayload.fields && webhookPayload.fields.chartName ? webhookPayload.fields.chartName.stringValue : null;

                if (responseText || webhookStatus.code === 0) {
                    console.log(`${cLog}Response as text message with message: ${responseText}`);
                    if (react != 'true' && image == null) {
                        bot.sendMessage(sessionId, responseText, {parse_mode: 'html'})
                            .catch(err => {
                                console.error(`${cLog}ERROR: ${err}`);
                            });
                    }
                    console.log(`${cLog}FulfillmentText processed`);
                    if (messages && messages.length > 0 && webhookStatus !== null) {
                        console.log(`${cLog}Response as multiple textMessages with messages: ${JSON.stringify(messages, null, '   ')}`);
                        messages.forEach((el, i) => {
                            let text = el.text.text[0];

                            if(text && text !== '' && text !== responseText) {
                                if (react != 'true' && response.action === 'data.description.request') {
                                    bot.sendMessage(sessionId, `<code>${text}</code>`, {parse_mode: 'html'})
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
                        console.log(`${cLog}FulfillmentMessages processed`);
                    } else if (messages.length = 0 || webhookStatus === null){
                        messages = null;
                    }

                    if (image && chartName && webhookStatus !== null) {

                        if (react != 'true'){

                            let tmpSessionPath = path.join(aiConfig.tmpPath, `/${sessionId}`);

                            if (!fs.existsSync(tmpSessionPath)){
                                fs.mkdirSync(tmpSessionPath);
                            }

                            let imagePath = path.join(tmpSessionPath,`/image.png`);

                            try {
                                fs.writeFileSync(imagePath, image, {encoding: 'base64'});
                                bot.sendPhoto(sessionId, imagePath, {caption: responseText})
                                    .then(() => {
                                        fs.unlinkSync(imagePath);
                                    })
                                    .catch(err => {
                                        console.error(`${cLog}ERROR: ${err}`);
                                    });
                            } catch (e) {
                                console.error(`${cLog}ERROR: ${e}`);
                                bot.sendMessage(sessionId, `There was an error processing the image of your chart`)
                                    .catch(err => {
                                        console.error(`${cLog}ERROR: ${err}`)
                                    });
                            }

                        }
                        messages.push({
                            type:'image/png',
                            content: image,
                            title: chartName
                        });
                    }

                    if (react == 'true') {
                        req.session.messages.push({who: 'bot', what: 'markdown', message: responseText, outputs: messages});
                    }
                    req.session.lastAction = action;
                    DialogFlow.createResponse(res, 200, responseText, action, messages, codeToSend);
                } else {
                    switch (webhookStatus.code) {
                        case 4: {
                            let message = 'Request has timed out. Please retry in a few minutes';
                            if (react != 'true') {
                                bot.sendMessage(sessionId, message)
                                    .catch(err => {
                                        console.error(`${cLog}ERROR: ${err}`);
                                    });
                            }
                            console.log(`${cLog}${webhookStatus.message}`);
                            if (react == 'true') {
                                req.session.messages.push({
                                    who: 'bot',
                                    what: 'markdown',
                                    message: message,
                                    outputs: null
                                });
                            }
                            DialogFlow.createResponse(res, 400, message);
                        }
                            break;

                        default:
                            let message = 'Something went wrong. Please retry in a few minutes';
                            if (react != 'true') {
                                bot.sendMessage(sessionId, message)
                                    .catch(err => {
                                        console.error(`${cLog}ERROR: ${err}`);
                                    });
                            }
                            console.log(`${cLog}Received empty speech`);
                            if (react == 'true') {
                                req.session.messages.push({
                                    who: 'bot',
                                    what: 'markdown',
                                    message: message,
                                    outputs: null
                                });
                            }
                            DialogFlow.createResponse(res, 400, message);
                    }
                }

            } else {
                let message = 'Something went wrong. Please retry in a few minutes';
                if (react != 'true') {
                    bot.sendMessage(sessionId, message)
                        .catch(err => {
                            console.error(`${cLog}ERROR: ${err}`);
                        });
                }
                console.log(`${cLog}Received empty result`);
                if (react == 'true') {
                    req.session.messages.push({who: 'bot', what: 'markdown', message: message, outputs: null});
                }
                DialogFlow.createResponse(res, 400, message);
            }
        })
        .catch(err => {
            console.error(`${cLog}Error processing your request`, err);
            let message = 'Error processing your request';
            if (react == 'true') {
                req.session.messages.push({who: 'bot', what: 'markdown', message: message, outputs: null});
            }
            DialogFlow.createResponse(res, 400, message);
        });
};

