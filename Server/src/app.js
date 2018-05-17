const DialogFlow = require('./Client/DialogFlow');
const DialogFlowConfig = require('./Client/DialogFlowConfig');
const fulfillment = require('./Fulfillment/Fulfillment');
const sessionHandler = require('./sessionHandler');
const deleteVariable = require('./Client/Methods/deleteVariable');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const PythonShell = require('python-shell');

const REST_PORT = (process.env.PORT || 5000);
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');

const APP_NAME = process.env.APP_NAME;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PROJECT_ID = process.env.PROJECT_ID;
const LANGUAGE_CODE = process.env.LANGUAGE_CODE;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CLIENT_WEBHOOK = process.env.CLIENT_WEBHOOK;
const FULFILLMENT_WEBHOOK = process.env.FULFILLMENT_WEBHOOK;

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

let tmpPath;
let aiConfig;
let ai;
let sessions = new Map();

const app = express();


app.use(bodyParser.json());
app.use(session({ secret: 'data-analysis-bot', resave: true, saveUninitialized: true}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'../../React')));
app.use(function (req, res, next) {
    if(!req.session.messages) req.session.messages = [];
    if(!req.session.datasets) req.session.datasets = [];
    if(!req.session.commands) req.session.commands = [];
    next();
});
// middleware route to support CORS and preflighted requests
app.use(function(req, res, next) {
  //Enabling CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Content-Type', 'application/json');
  if (req.method == 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,PUT, POST, DELETE');
    return res.status(200).json({});
  }
  // make sure we go to the next routes
  next();
});

app.route('/')
    .get((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        res.sendFile("React/index.html", {root: "./" });
    });

app.route('/messages')
    .get((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({
            messages: req.session.messages,
            variables: req.session.datasets
        }));
        res.end();
    });

app.route('/clear')
    .get((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        req.session.messages = [];
        res.write(JSON.stringify({clear: true}));
        res.end();
    });

app.route('/variable/:filename')
    .get((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        let data = req.params.filename;
        let el = req.session.datasets.find((element) => { return element.name === data });
        let ret = '';
        if(el){
            ret = el.describe;
        }else{
            ret = "Variable not found";
        }
        res.write(JSON.stringify(ret));
        res.end();
    });

app.route('/delete/:id')
    .get((req, res) => {
        sessionHandler.sessionHandler(sessions, req);

        let dialogSessionId = ai.sessionIds.get(req.sessionID);

        deleteVariable.deleteVariable(req, res, tmpPath, dialogSessionId);

    });

app.route(`/${CLIENT_WEBHOOK}`)
    .post((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        console.log(`POST ${CLIENT_WEBHOOK}`);
        try {
            ai.processMessage(req, res);
        } catch (err) {
            return res.status(400).send(`Error while processing ${err.message}`);
        }
    });

const allowed_file = (mime) => {
    return ["csv", "xls", "data"].includes(mime.split('.')[1]);
};

app.route('/upload')
    .post((req, res) => {
        sessionHandler.sessionHandler(sessions, req);
        let path_ = path.join(tmpPath,`/${req.sessionID}`);
        console.log(`Path to save: ${path_}`);
        if (!fs.existsSync(path_)){
            try {
                fs.mkdirSync(path_);
            } catch (e) {
                console.error(`ERROR: ${e}`);
                res.end();
            }
        }
        let name = "";
        if(req.files.file && req.files.file.name && allowed_file(req.files.file.name)){
            let stream = req.files.file.data;
            let name = req.files.file.name;
            let file = req.files.file;

            let fileLink = `${path_}/${name}`;

            file.mv(fileLink, (err) => {
                if (err) {
                    console.error(`ERROR: ${err}`);
                } else {
                    console.log('File saved successfully')
                }
            });

            try {
                let pyshell = new PythonShell('readfile.py', {scriptPath: 'Server/src/Client/py/',});
                pyshell.send(stream.toString());

                pyshell.on('message', function (message) {
                    req.session.datasets.push({name: name, describe: message});
                });
                pyshell.end(function (err) {
                    if (err) throw err;
                    else console.log('Variables loaded');
                });
            } catch (err) {
                console.error(`ERROR: ${err}`);
            }

            req.body = {
                react: 'true',
                message: {
                    document: {
                        file_name: name,
                        file_link: fileLink
                    }
                },
            };

            try {
                ai.processMessage(req, res);
            } catch (err) {
                return res.status(400).send(`Error while processing ${err.message}`);
            }

        }else{
            res.write(JSON.stringify(name));
            res.end();
        }
    });

app.route(`/${FULFILLMENT_WEBHOOK}`)
    .post((req,res) => {
        console.log(`POST ${FULFILLMENT_WEBHOOK}`);
        try {
            fulfillment.dialogflowFulfillment(req,res);
        } catch (err) {
            console.error(`ERROR: ${err}`);
            return res.status(400).send(`Error while processing ${err.message}`);
        }
    });

app.listen(REST_PORT, function () {
    console.log(`Rest service ready on port ${REST_PORT}`);

    tmpPath = path.join(__dirname, '../../tmp');

    fs.mkdir(tmpPath , err => {
        if (err) {
            return console.error(`ERROR: ${err}`);
        }

        console.log(`Temp Directory created in ${tmpPath}`);

    });

    aiConfig = new DialogFlowConfig(
        GOOGLE_APPLICATION_CREDENTIALS,
        PROJECT_ID,
        LANGUAGE_CODE,
        TELEGRAM_TOKEN,
        CLIENT_WEBHOOK,
        DEV_CONFIG,
        tmpPath
    );

    ai = new DialogFlow(aiConfig, baseUrl);

});

