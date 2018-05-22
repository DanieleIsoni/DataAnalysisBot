const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const dialogflow = require('dialogflow');
const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});
const fLog = '[FULFILLMENT] ';

module.exports.storeAttributes = function (fileName, fileLink, response, session){
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`]
    };
    PythonShell.run('getAttributes.py', options, function (err, results) {
        if(err){
            console.error(`${fLog}ERROR: ${err}`);
        }
        let attributes = `${results}`.split(',');

        if (attributes === undefined) {
            attributes = '';
        }

        let entries = [];
        attributes.forEach((element) => {
            entries.push({
               "value": `${element}`,
                "synonyms":[
                    `${element}`
                ]
            });
        });

        let sessionEntityType = {
            name: `${session}/entityTypes/Attribute`,
            entityOverrideMode: "ENTITY_OVERRIDE_MODE_OVERRIDE",
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
