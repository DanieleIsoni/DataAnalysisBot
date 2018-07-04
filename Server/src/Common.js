const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tmpPath = path.join(__dirname,'../../tmp');
const dialogflow = require('dialogflow');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});

let sessions = new Map();

module.exports = {
    sessions
};

module.exports.sessionTimeoutHandler = (sessionsTimeOut, req) => {
    if (!sessionsTimeOut.has(req.sessionID)){
        sessionsTimeOut.set(req.sessionID, setTimeout(destroySession, 10*60*1000, req.sessionID, req.session));
    } else {
        clearTimeout(sessionsTimeOut.get(req.sessionID));
        sessionsTimeOut.set(req.sessionID, setTimeout(destroySession, 10*60*1000, req.sessionID, req.session));
    }
};


let destroySession = (sessionID, session) => {
    let sessionFolder = path.join(tmpPath, `/${sessionID}`);
    if(fs.existsSync(sessionFolder)){
        try {
            rimraf.sync(sessionFolder);
            console.log(`Session Folder deleted`)
        } catch (err) {
            console.error(`ERROR: error while deleting ${sessionFolder}.\n${err}`);
        }
    }
    session.destroy((err) => {
        if(err) {
            console.error(`ERROR: error while destroying the session.\n${err}`);
        } else {
            console.log(`Session destroyed`);
            sessions.get(sessionID).chartCount = 0;
            sessions.get(sessionID).charts = [];
            sessions.get(sessionID).variablesMap.clear();
            sessions.get(sessionID).variable = null;
        }
    });
};

module.exports.sessionHandler = (req) => {
    console.log(`message: ${JSON.stringify(req.body.message, null, '   ')}`);
    if (req.body.message === undefined || (req.body.message !== undefined && req.body.message.chat === undefined)) {
        if (!sessions.has(req.sessionID)) {
            sessions.set(req.sessionID, {
                variable: null,
                /**
                 *
                 * Key: variable name
                 *
                 * Value: {
                 *           variableLink: urlVariable,
                 *           attributes: []
                 *        }
                 *
                 */
                variablesMap: new Map(),
                /**
                 *
                 *
                 * Elements with form of:
                 * {
                 *    name: 'chart1',
                 *    variable: 'iris.csv'
                 *    test: 'maximum',
                 *    testAttr: 'seplen',
                 *    attr: 'class',
                 *    testOrig: 'max',
                 *    chartType: 'barchart'
                 *    xLabel: {
                 *       family: 'serif',
                 *       color: 'red',
                 *       weight: 'bold',
                 *       size: '12'
                 *    },
                 *    yLabel: {
                 *       family: 'serif',
                 *       color: 'red',
                 *       weight: 'bold',
                 *       size: '12'
                 *    }
                 * }
                 *
                 */
                charts: [],
                chartCount: 0,
                react: `${req.body.react}`
            });
            console.log(`Request: ${JSON.stringify(req.sessionID, null, '   ')}`);
            console.log(`session ${req.sessionID} created`);
            console.log(`session: ${JSON.stringify(sessions.get(req.sessionID), null, '   ')}`);
        }
    } else {
        console.log(`ENTERED`);
        let chatId = `${req.body.message.chat.id}`;
        if (!sessions.has(chatId)) {
            console.log(`ENTERED 2`);
            sessions.set(chatId, {
                react: 'false'
            });
            console.log(`session ${chatId} created`);
        }
        console.log(`session: ${JSON.stringify(sessions.get(chatId), null, '   ')}`);
    }
};

module.exports.createEntitiesArray = (arrIn, arrOut=[]) => {
    arrIn.forEach((element) => {
            arrOut.push({
               "value": `${element}`,
                "synonyms":[
                    `${element}`
                ]
            });
        });

    return arrOut;
};

module.exports.sendChartNameEntity = (sessionPath, sessionId) => {
    let entries = [];
    let session = sessions.get(sessionId);
    let charts = session.charts;
    charts.forEach(element => {
        entries.push({
            "value": `${element.name}`,
            "synonyms":[
                `${element.name}`
            ]
        })
    });


    let sessionEntityType = {
        name: `${sessionPath}/entityTypes/ChartName`,
        entityOverrideMode: "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
        entities: entries
    };
    let request = {
        parent: sessionPath,
        sessionEntityType: sessionEntityType
    };

    sessionEntityTypesClient.createSessionEntityType(request)
            .then(responses => {
                let res = responses[0];

                if (res) {
                    console.log(`ChartName Entity updated.`);
                } else {
                    console.warn(`Something went wrong in updating the entity`);
                }
            })
            .catch(err => {
                console.error(`ERROR: ${err}`);
            });
};