const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const fLog = '[FULFILLMENT] ';

module.exports.plotChart = (fileLink, test, test_original, attr, response) => {
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Python/',
        args: [`${fileLink}`, `${test}`, `${attr}`]
    };


};