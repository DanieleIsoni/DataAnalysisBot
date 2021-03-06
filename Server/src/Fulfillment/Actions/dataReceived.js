const PythonShell = require('python-shell');
//const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PYPATH = process.env.PYPATH;
const dialogflow = require('dialogflow');
const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});
const Common = require('../../Common');

const fLog = '[FULFILLMENT] ';

module.exports.dataReceived = (contexts, action, sessionPath, sessionId, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/data_received`;
    });

    if (data_received) {
        let fileName = data_received.parameters.file_name;
        let fileLink = data_received.parameters.file_link;
        let divider = data_received.parameters.divider;

        storeAttributes(fileName, fileLink, divider, response, sessionPath, sessionId);
    } else {
        console.error(`${fLog}Context not found for action ${action}`);
        response.send({
            fulfillmentText: `Something went wrong. Try in a few minutes`,
        });
    }
};


let storeAttributes = function (fileName, fileLink, divider, response, sessionPath, sessionId){
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`, `${divider}`]
    };
    if (PYPATH)
        options.pythonPath = PYPATH;

    let session = Common.sessions.get(sessionId);

    PythonShell.run('getAttributes.py', options, function (err, results) {
        if(err){
            console.error(`${fLog}ERROR: ${err}`);
        }
        let attributes = `${results}`.split(',');

        if (attributes === undefined) {
            attributes = '';
        }

        let entries = Common.createEntitiesArray(attributes);

        session.variablesMap.forEach((value,key) => {
            if (key !== fileName){
                entries = Common.createEntitiesArray(value.attributes, entries);
            }
        });

        let sessionEntityType = {
            name: `${sessionPath}/entityTypes/Attribute`,
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
                    session.variablesMap.set(fileName, {variableLink: fileLink, attributes: attributes, divider: divider});
                    let message = `Stored ${fileName} which contains: ${attributes.join(', ')}\nWhat do you want to do with this data?`;
                    response.send({
                        fulfillmentText: message
                    });
                } else {
                    response.send({
                        fulfillmentText: `Something went wrong, try uploading the data again`
                    });
                }
            })
            .catch(err => {
                console.error(`${fLog}ERROR: ${err}`);
            });
    });
};
