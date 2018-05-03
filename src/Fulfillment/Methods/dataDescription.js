const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const fLog = '[FULFILLMENT] ';

module.exports.dataDescription = function (fileName, fileLink, response){
    const options = {
        mode: 'text',
        scriptPath: 'src/Python/',
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
                           `<code>${message}</code>`
                       ]
                   }
               });
               message = '';
           }
        });

        if (DEV_CONFIG) console.log('\n'+JSON.stringify(messages, null, '   '));
        response.send({
            fulfillmentText: 'This is the basic description for your data:',//`<code>${message}</code>`,
            fulfillmentMessages: messages
        });
    });
};