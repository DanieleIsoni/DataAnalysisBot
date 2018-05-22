const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const fLog = '[FULFILLMENT] ';

module.exports.dataDescription = function (fileName, fileLink, response){
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`]
    };
    PythonShell.run('dataDescription.py', options, function (err, results) {
        if(err){
            console.error(`${fLog}ERROR: ${err}`);
        }
        let attributes = `${results}`.split(',');
        let messages = [];
        let message = '';
        attributes.forEach(element => {
           if (!element.startsWith('Name:') && !element.startsWith(' dtype:')){
               message += `${element}\n`;
           } else if (element.startsWith('Name:')){
               messages.push({
                   platform: 'PLATFORM_UNSPECIFIED',
                   text: {
                       text: [
                           `${message}`
                       ]
                   }
               });
               message = '';
           }
        });

        if (DEV_CONFIG) console.log(`${fLog}\n${JSON.stringify(messages, null, '   ')}`);

        let codeToSend = `import pandas as pd
import numpy as np
import urllib


url = ${fileLink}
try:
    data_set = pd.read_csv(url, sep=',', na_values=["?"])
    for el in data_set:
        print(el)
        if data_set[el].dtype == np.int64 or data_set[el].dtype == np.float64:
            print(data_set[el].describe().apply(lambda x: format(x, 'f')))
        else:
            print(data_set[el].describe())
except urllib.error.HTTPError as err:
    if err.code == 404:
        print('ERROR: The provided url is unreachable')`;

        response.send({
            fulfillmentText: 'This is the basic description for your data:',//`<code>${message}</code>`,
            fulfillmentMessages: messages,
            payload: {
                code: codeToSend
            }
        });
    });
};