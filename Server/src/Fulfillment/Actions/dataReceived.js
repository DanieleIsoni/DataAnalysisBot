const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const PROJECT_ID = process.env.PROJECT_ID;
const gappCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const dialogflow = require('dialogflow');
const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient({
    keyFileName: gappCred,
    projectId: PROJECT_ID
});
const Common = require('../../Common');

const fLog = '[FULFILLMENT] ';

module.exports.dataReceived = (contexts, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });

    if (data_received) {
        let fileName = data_received.parameters.file_name;
        let fileLink = data_received.parameters.file_link;

        storeAttributes(fileName, fileLink, response, session);
    } else {
        console.error(`${fLog}Context not found for action ${action}`);
        response.send({
            fulfillmentText: `Something went wrong. Try in a few minutes`,
        });
    }
};


let storeAttributes = function (fileName, fileLink, response, session){
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

        let entries = Common.createEntitiesArray(attributes);


        // attributes.forEach((element) => {
        //     entries.push({
        //        "value": `${element}`,
        //         "synonyms":[
        //             `${element}`
        //         ]
        //     });
        // });
        Common.variablesMap.forEach((value,key) => {
            if (key !== fileName){
                entries = Common.createEntitiesArray(value.attributes, entries);
                // value.attributes.forEach(el => {
                //    entries.push({
                //         "value": `${el}`,
                //         "synonyms":[
                //             `${el}`
                //         ]
                //     });
                // });
            }
        });

        let sessionEntityType = {
            name: `${session}/entityTypes/Attribute`,
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
                    Common.variablesMap.set(fileName, {variableLink: fileLink, attributes: attributes});
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
