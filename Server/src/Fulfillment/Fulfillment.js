const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');
const dataReceived = require('./Actions/dataReceived');
const dataDescriptionRequest = require('./Actions/dataDescriptionRequest');
const testRequest = require('./Actions/testRequest');
const plotChart = require('./Actions/plotChart');

// const plotChart = require('./Methods/plotChart');
const fLog = '[FULFILLMENT] ';

module.exports.dialogflowFulfillment = (request, response) => {
    let contexts = request.body.queryResult.outputContexts;
    let session = request.body.session;
    let action = request.body.queryResult.action;
    let parameters = request.body.queryResult.parameters;

    if (DEV_CONFIG) console.log(`${fLog}Request: ${JSON.stringify(request.body, null, '   ')}`);

    switch (action) {
        case 'data.received':
            dataReceived.dataReceived(contexts, action, session, response);
            break;
        case 'data.description.request':
            dataDescriptionRequest.dataDescriptionRequest(contexts, action, session, response);
            break;
        case 'test.request':
            testRequest.testRequest(contexts, parameters, action, session, response);
            break;
        case 'test.request.fu.attribute':
            testRequest.testRequestFuAttribute(contexts, parameters, action, session, response);
            break;
        case 'test.request.fu.test':
            testRequest.testRequestFuTest(contexts, parameters, action, session, response);
            break;
        case 'plot.chart':
            plotChart.plotChart(contexts, parameters, action, session, response);
            break;
        case 'plot.chart.fu.label':
            plotChart.plotChartFuLabel(contexts, parameters, action, session, response);
            break;
        default:
            console.log(`${fLog}No action matched`);
            response.send({
                fulfillmentText: `No action matched`
            });
    }
};


