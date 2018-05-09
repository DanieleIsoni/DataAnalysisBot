const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const fLog = '[FULFILLMENT] ';

module.exports.executeTest = function(fileLink, test, test_original, attr, response){
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Python/',
        args: [`${fileLink}`, `${test}`, `${attr}`]
    };

    PythonShell.run('executeTest.py', options, (err, result) => {
        if (err){
            console.error(`${fLog}ERROR: ${err}`);
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
    print('ERROR: The provided url is unreachable')
`

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