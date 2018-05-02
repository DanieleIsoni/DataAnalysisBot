const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');

module.exports.executeTest = function(fileLink, test, test_original, attr, response){
    const options = {
        mode: 'text',
        scriptPath: 'src/Python/',
        args: [`${fileLink}`, `${test}`, `${attr}`]
    };

    PythonShell.run('executeTest.py', options, (err, result) => {
        if (err){
            console.error(`ERROR: ${err}`);
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

        response.send({
            fulfillmentText: message
        });
    });
};