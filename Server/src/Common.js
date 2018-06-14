const dialogflow = require('dialogflow');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});

// module.exports.sessionHandler = (sessions, sessionId) => {
//     if (sessions)
// };

let variable = null;
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
let variablesMap = new Map();

/**
 *
 * 722680c
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
let charts = [];
let chartCount = 0;

module.exports = {
    variable,
    variablesMap,
    charts,
    chartCount
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

module.exports.sendChartNameEntity = (session) => {
    let entries = [];
    charts.forEach(element => {
        entries.push({
            "value": `${element.name}`,
            "synonyms":[
                `${element.name}`
            ]
        })
    });


    let sessionEntityType = {
        name: `${session}/entityTypes/ChartName`,
        entityOverrideMode: "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
        entities: entries
    };
    let request = {
        parent: session,
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