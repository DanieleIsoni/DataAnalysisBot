const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');
const dataReceived = require('./Actions/dataReceived');
const dataDescriptionRequest = require('./Actions/dataDescriptionRequest');
const testRequest = require('./Actions/testRequest');
const plotChart = require('./Actions/plotChart');
const tDataReceived = require('./Telegram/dataReceived');
const tDataDescriptionRequest = require('./Telegram/dataDescriptionRequest');
const tTestRequest = require('./Telegram/testRequest');
const tPlotChart = require('./Telegram/plotChart');
const Common = require('../Common');

// const plotChart = require('./Methods/plotChart');
const fLog = '[FULFILLMENT] ';

module.exports.dialogflowFulfillment = (request, response) => {
    let contexts = request.body.queryResult.outputContexts;
    let sessionPath = request.body.session;
    let sessionId = sessionPath.split('/')[sessionPath.split('/').length-1];
    let action = request.body.queryResult.action;
    let parameters = request.body.queryResult.parameters;

    console.log(`${fLog}ACTION: ${action}`);

    switch (action) {
        case 'data.received':
            if (Common.sessions.get(sessionId).react === 'true')
                dataReceived.dataReceived(contexts, action, sessionPath, sessionId, response);
            else
                tDataReceived.dataReceived(contexts, action, sessionPath, response);
            break;
        case 'data.description.request':
            if (Common.sessions.get(sessionId).react === 'true')
                dataDescriptionRequest.dataDescriptionRequest(contexts, action, sessionPath, sessionId, response);
            else
                tDataDescriptionRequest.dataDescriptionRequest(contexts, action, sessionPath, response);
            break;
        case 'test.request':
            if (Common.sessions.get(sessionId).react === 'true')
                testRequest.testRequest(contexts, parameters, action, sessionPath, sessionId, response);
            else
                tTestRequest.testRequest(contexts, parameters, action, sessionPath, response);
            break;
        case 'test.request.fu.attribute':
            if (Common.sessions.get(sessionId).react === 'true')
                testRequest.testRequestFuAttribute(contexts, parameters, action, sessionPath, sessionId, response);
            else
                tTestRequest.testRequestFuAttribute(contexts, parameters, action, sessionPath, response);
            break;
        case 'test.request.fu.test':
            if (Common.sessions.get(sessionId).react === 'true')
                testRequest.testRequestFuTest(contexts, parameters, action, sessionPath, sessionId, response);
            else
                tTestRequest.testRequestFuTest(contexts, parameters, action, sessionPath, response);
            break;
        case 'plot.chart':
            if (Common.sessions.get(sessionId).react === 'true')
                plotChart.plotChart(contexts, parameters, action, sessionPath, sessionId, response);
            else
                tPlotChart.plotChart(contexts, parameters, action, sessionPath, response);
            break;
        case 'plot.chart.fu.label':
            if (Common.sessions.get(sessionId).react === 'true')
                plotChart.plotChartFuLabel(contexts, parameters, action, sessionPath, sessionId, response);
            else
                tPlotChart.plotChartFuLabel(contexts, parameters, action, sessionPath, response);
            break;
        default:
            console.warn(`${fLog}No action matched`);
            response.send({
                fulfillmentText: `No action matched`
            });
    }
};


