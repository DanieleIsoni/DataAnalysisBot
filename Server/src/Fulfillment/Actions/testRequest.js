const Common = require('../../Common');
const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');
const fLog = '[FULFILLMENT] ';

module.exports.testRequest = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const test_request = contexts.find(obj => {
        return obj.name === `${session}/contexts/test_request`;
    });

    if (data_received && test_request) {
        let fileLink = Common.variablesLink.get(Common.variable);
        console.log(`TEST Path variable: ${fileLink}`);
        let test = parameters.Test;
        let test_original = test_request.parameters['Test.original'];
        let attr = parameters.Attribute;
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

        executeTest(fileLink, test, test_original, attr, response);
    } else {
        console.error(`${fLog}Context not found for action ${action}`);
        response.send({
            fulfillmentText: `Something went wrong. Try in a few minutes`,
        });
    }
};

module.exports.testRequestFuAttribute = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const test_request = contexts.find((obj) => {
        return obj.name === `${session}/contexts/test_request`;
    });
    const testrequest_followup_attribute = contexts.find(obj => {
        return obj.name === `${session}/contexts/testrequest-followup`;
    });

    if (test_request && data_received && testrequest_followup_attribute) {
        let fileLink = Common.variablesLink.get(Common.variable);
        console.log(`TEST.ATTR Path variable: ${fileLink}`);
        let test = test_request.parameters.Test;
        let test_original = test_request.parameters['Test.original'];
        let attr = parameters.Attribute;
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

        executeTest(fileLink, test, test_original, attr, response);
    } else {
        console.error(`${fLog}Context not found for action ${action}`);
        response.send({
            fulfillmentText: `Something went wrong. Try in a few minutes`
        });
    }
};

module.exports.testRequestFuTest = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const test_request = contexts.find((obj) => {
        return obj.name === `${session}/contexts/test_request`;
    });
    const testrequest_followup_test = contexts.find(obj => {
        return obj.name === `${session}/contexts/testrequest-followup-2`;
    });

    if (test_request && data_received && testrequest_followup_test) {
        let fileLink = Common.variablesLink.get(Common.variable);
        console.log(`TEST.TEST Path variable: ${fileLink}`);
        let test = parameters.Test;
        let test_original = testrequest_followup_test.parameters['Test.original'];
        let attr = test_request.parameters.Attribute;
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

        executeTest(fileLink, test, test_original, attr, response);
    } else {
        console.error(`${fLog}Context not found for action ${action}`);
        response.send({
            fulfillmentText: `Something went wrong. Try in a few minutes`
        });
    }
};


let executeTest = function(fileLink, test, test_original, attr, response){
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`, `${test}`, `${attr}`]
    };

    PythonShell.run('executeTest.py', options, (err, result) => {
        if (err){
            console.error(`${fLog}ERROR: ${err}`);
            return response.send({
                fulfillmentText: 'Something went wrong. Either you executed a test on not Numeric variables or an internal error occurred'
            });
        }

        let message;
        switch (test){
            case 'maximum':
            case 'minimum':
            case 'mean':
            case 'std':
            case 'var':{
                message = `The ${test_original} for ${attr} is ${result}`;
            }
                break;
            default: {
                message = `${result}`
            }
        }

        let codeToSend = `import pandas as pd
import urllib


url = ${fileLink}
test_type = ${test}
selected_attr = ${attr}
try:
    data_set = pd.read_csv(url, sep=',', na_values=["?"])
    result = {
        'maximum': data_set[selected_attr].max(),
        'minimum': data_set[selected_attr].min(),
        'mean': data_set[selected_attr].mean(),
        'std': data_set[selected_attr].std(),
        'var': data_set[selected_attr].var()
    }.get(test_type)
    
    if result:
        print(result)
    else:
        print('Something went wrong')
except urllib.error.HTTPError as err:
    if err.code == 404:
    print('ERROR: The provided url is unreachable')`;

        response.send({
            fulfillmentText: message,
            fulfillmentMessages: [
                {
                   platform: 'PLATFORM_UNSPECIFIED',
                   text: {
                       text: [
                           `${result}`
                       ]
                   }
                }
            ],
            payload: {
                code: codeToSend
            }
        });
    });
};