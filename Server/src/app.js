const DialogFlow = require('./Client/DialogFlow');
const DialogFlowConfig = require('./Client/DialogFlowConfig');
const fulfillment = require('./Fulfillment/Fulfillment');
const deleteVariable = require('./Client/Methods/deleteVariable');
const Common = require('./Common');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const PythonShell = require('python-shell');
const sslRedirect = require('heroku-ssl-redirect');
const compression = require('compression');

const REST_PORT = (process.env.PORT || 5000);
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');

const APP_NAME = process.env.APP_NAME;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PROJECT_ID = process.env.PROJECT_ID;
const LANGUAGE_CODE = process.env.LANGUAGE_CODE;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CLIENT_WEBHOOK = process.env.CLIENT_WEBHOOK;
const FULFILLMENT_WEBHOOK = process.env.FULFILLMENT_WEBHOOK;
const PYPATH = process.env.PYPATH;
const TESTING_ENV_URL = process.env.TESTING_ENV_URL;

let baseUrl = "";
if (APP_NAME){
    // Heroku case
    baseUrl = `https://${APP_NAME}.herokuapp.com`;
} else {
    // testing enviroment
    if (TESTING_ENV_URL) baseUrl = TESTING_ENV_URL;
    // console.error('Set up the url of your service here and remove exit code!');
    // process.exit(1);
}

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

let tmpPath;
let aiConfig;
let ai;
let sessionsTimeout = new Map();

const app = express();

app.use(sslRedirect(['production', 'development']));
app.use(compression());
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

app.route('/')
    .get((req, res) => {
        Common.sessionTimeoutHandler(sessionsTimeout, req);
        res.sendFile("React/index.html", {root: "./" });
    });

app.route('/messages')
    .get((req, res) => {
        Common.sessionTimeoutHandler(sessionsTimeout, req);

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({
            messages: req.session.messages,
            variables: req.session.datasets
        }));
        res.end();
    });

app.route('/clear')
    .get((req, res) => {
        Common.sessionTimeoutHandler(sessionsTimeout, req);
        req.session.messages = [];
        res.write(JSON.stringify({clear: true}));
        res.end();
    });

app.route('/variable/:filename')
    .get((req, res) => {
        Common.sessionTimeoutHandler(sessionsTimeout, req);
        if (req.session.datasets.length >0) {
            let data = req.params.filename;
            let el = req.session.datasets.find((element) => {
                return element.name === data
            });
            let ret = '';
            if (el) {
                ret = el.describe;
                res.write(JSON.stringify(ret));
            } else {
                ret = "Variable not found";
                res.status(404).write(JSON.stringify(ret));
            }
        } else {
            res.status(400)
        }

        res.end();
    });

app.route('/delete/:id')
    .get((req, res) => {
        Common.sessionTimeoutHandler(sessionsTimeout, req);

        let sessionId = req.sessionID;

        deleteVariable.deleteVariable(req, res, tmpPath, sessionId);

    });

app.route(`/${CLIENT_WEBHOOK}`)
    .post((req, res) => {
        Common.sessionHandler(req);
        Common.sessionTimeoutHandler(sessionsTimeout, req);
        console.log(`POST ${CLIENT_WEBHOOK}`);
        try {
            ai.processMessage(req, res);
        } catch (err) {
            return res.status(400).send(`Error while processing ${err.message}`);
        }
    });

app.route(`/python`)
    .post((req, res) => {
        Common.sessionHandler(req);
        Common.sessionTimeoutHandler(sessionsTimeout, req);
        console.log(`POST python`);

        if (req.body && req.body.message && req.body.message.text){
            let code = req.body.message.text;
            if (code){
                let tmpSessionPath = `tmp/${req.sessionID}`;
                if(!fs.existsSync(tmpSessionPath)){
                    try {
                        fs.mkdirSync(tmpSessionPath);
                    } catch (e) {
                        console.error(`ERROR: ${e}`);
                        res.status(400).json({
                            who: 'bot',
                            message: `Something went wrong. Try in a few minutes`,
                        });
                    }
                }

                let script = 'tmpScript.py';
                let scriptPath = `${tmpSessionPath}/${script}`;

                try {
                    fs.writeFileSync(scriptPath, `${code}`);
                }catch (e) {
                    console.error(`ERROR: ${e}`);
                    res.status(400).json({
                        who: 'bot',
                        message: `Something went wrong. Try in a few minutes`,
                    });
                }

                const options = {
                    mode: 'text',
                    scriptPath: tmpSessionPath
                };

                PythonShell.run(script, options, (err, result) => {
                    if (err) {
                        console.error(`ERROR: ${err}`);
                        return res.status(400).json({
                            who: 'bot',
                            message: `${err}`,
                        });
                    }

                    result = `${result}`.split(',');

                    let messages = [];

                    result.forEach(el => {
                        messages.push({
                            type: 'text/plain',
                            content: el
                        });
                    });

                    res.status(200).json({
                        who: 'bot',
                        message: `This are results from your script:`,
                        outputs: messages,
                    });

                });
            }
        }

    });

const allowed_file = (mime) => {
    return ["csv", "xls", "data"].includes(mime.split('.')[1]);
};

app.route('/upload')
    .post((req, res) => {
        Common.sessionHandler(req);
        Common.sessionTimeoutHandler(sessionsTimeout, req);
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
            let variable = req.body.variabile;
            let divider = req.body.divider;
            let head = JSON.parse(req.body.head);

            console.log(`HEAD: ${JSON.stringify(head, null, '   ')}`);

            let fileLink = `${path_}/${name}`;

            file.mv(fileLink, (err) => {
                if (err) {
                    console.error(`ERROR: ${err}`);
                } else {
                    console.log('File saved successfully')
                }
            });

            try {
                let options = {
                    scriptPath: 'Server/src/Client/py/',
                };
                if(PYPATH)
                    options.pythonPath = PYPATH;
                let pyshell = new PythonShell('readfile.py', options);
                pyshell.send(stream.toString());

                pyshell.on('message', function (message) {
                    const options = {
                        mode: 'text',
                        scriptPath: 'Server/src/Fulfillment/Python/',
                        args: [`${fileLink}`, `${divider}`]
                    };
                    if (PYPATH)
                        options.pythonPath = PYPATH;

                    PythonShell.run('getAttributes.py', options, function (err, results) {
                        if (err) {
                            console.error(`ERROR: ${err}`);
                        } else {
                            let attributes = `${results}`.split(',');

                            if (attributes === undefined) {
                                attributes = '';
                            }

                            req.session.datasets.push({
                                name: name,
                                describe: message,
                                attributes: attributes,
                                head: head});
                        }
                    });
                });
                pyshell.end(function (err) {
                    if (err) throw err;
                    else {
                        console.log('Variables loaded');
                        req.body = {
                            react: 'true',
                            variabile: variable,
                            message: {
                                document: {
                                    file_name: name,
                                    file_link: fileLink,
                                    divider: divider
                                }
                            },
                        };

                        try {
                            ai.processMessage(req, res);
                        } catch (err) {
                            return res.status(400).send(`Error while processing ${err.message}`);
                        }
                    }
                });
            } catch (err) {
                console.error(`ERROR: ${err}`);
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

    if(!fs.existsSync(tmpPath)) {
        fs.mkdir(tmpPath, err => {
            if (err) {
                return console.error(`ERROR: ${err}`);
            }

            console.log(`Temp Directory created in ${tmpPath}`);

        });
    } else {
        console.info(`Temp Dir already exists in ${tmpPath}`);
    }

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

