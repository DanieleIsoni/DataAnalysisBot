const DialogFlow = require('./Client/DialogFlow');
const DialogFlowConfig = require('./Client/DialogFlowConfig');
const express = require('express');
const bodyParser = require('body-parser');

const REST_PORT = (process.env.PORT || 5000);
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');

const APP_NAME = process.env.APP_NAME;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PROJECT_ID = process.env.PROJECT_ID;
const LANGUAGE_CODE = process.env.LANGUAGE_CODE;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CLIENT_WEBHOOK = process.env.CLIENT_WEBHOOK;

let baseUrl = "";
if (APP_NAME){
    // Heroku case
    baseUrl = `https://${APP_NAME}.herokuapp.com`;
} else {
    console.error('Set up the url of your service here and remove exit code!');
    process.exit(1);
}

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const aiConfig = new DialogFlowConfig(
    GOOGLE_APPLICATION_CREDENTIALS,
    PROJECT_ID,
    LANGUAGE_CODE,
    TELEGRAM_TOKEN,
    CLIENT_WEBHOOK,
    DEV_CONFIG
);
const ai = new DialogFlow(aiConfig, baseUrl);

const app = express();
app.use(bodyParser.json());
app.post(`/${CLIENT_WEBHOOK}`, (req, res) => {
    if (aiConfig.devConfig) console.log(`POST ${CLIENT_WEBHOOK}`);
    try {
        ai.processMessage(req, res);
    } catch (err) {
        return res.status(400).send(`Error while processing ${err.message}`);
    }
});

app.listen(REST_PORT, function () {
    if (aiConfig.devConfig) console.log(`Rest service ready on port ${REST_PORT}`);
});