const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG === 'true');
const storeAttributes = require('./Methods/storeAttributes');
const executeTest = require('./Methods/executeTest');
const dataDescription = require('./Methods/dataDescription');
const plotChart = require('./Methods/plotChart');
const fLog = '[FULFILLMENT] ';

module.exports.dialogflowFulfillment = (request, response) => {
    let contexts = request.body.queryResult.outputContexts;
    let session = request.body.session;
    let action = request.body.queryResult.action;
    let parameters = request.body.queryResult.parameters;

    if (DEV_CONFIG) console.log(`${fLog}Request: ${JSON.stringify(request.body, null, '   ')}`);

    switch (action) {
        case 'data.received': {
            const data_received = contexts.find(obj => {
                return obj.name === `${session}/contexts/data_received`;
            });

            if (data_received) {
                let fileName = data_received.parameters.file_name;
                let fileLink = data_received.parameters.file_link;

                storeAttributes.storeAttributes(fileName, fileLink, response, session);
            } else {
                console.error(`${fLog}Context not found for action ${action}`);
                response.send({
                    fulfillmentText: `Something went wrong. Try in a few minutes`,
                });
            }
        }
            break;
        case 'data.description.request': {
            const data_received = contexts.find(obj => {
                return obj.name === `${session}/contexts/data_received`;
            });

            if (data_received){
                let fileName = data_received.parameters.file_name;
                let fileLink = data_received.parameters.file_link;

                dataDescription.dataDescription(fileName, fileLink, response);
            } else {
               console.error(`${fLog}Context not found for action ${action}`);
                response.send({
                    fulfillmentText: `Something went wrong. Try in a few minutes`
                });
            }
        }
            break;
        case 'test.request': {
            const data_received = contexts.find(obj => {
                return obj.name === `${session}/contexts/data_received`;
            });
            const test_request = contexts.find(obj => {
                return obj.name === `${session}/contexts/test_request`;
            });

            if (data_received && test_request) {
                let fileLink = data_received.parameters.file_link;
                let test = parameters.Test;
                let test_original = test_request.parameters['Test.original'];
                let attr = parameters.Attribute;
                if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

                executeTest.executeTest(fileLink, test, test_original, attr, response);
            } else {
                console.error(`${fLog}Context not found for action ${action}`);
                response.send({
                    fulfillmentText: `Something went wrong. Try in a few minutes`,
                });
            }
        }
            break;
        case 'test.request.fu.attribute': {
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
                let fileLink = data_received.parameters.file_link;
                let test = test_request.parameters.Test;
                let test_original = test_request.parameters['Test.original'];
                let attr = parameters.Attribute;
                if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

                executeTest.executeTest(fileLink, test, test_original, attr, response);
            } else {
                console.error(`${fLog}Context not found for action ${action}`);
                response.send({
                    fulfillmentText: `Something went wrong. Try in a few minutes`
                });
            }
        }
            break;
        case 'test.request.fu.test': {
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
                let fileLink = data_received.parameters.file_link;
                let test = parameters.Test;
                let test_original = testrequest_followup_test.parameters['Test.original'];
                let attr = test_request.parameters.Attribute;
                if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test}\nChosen attribute: ${attr}`);

                executeTest.executeTest(fileLink, test, test_original, attr, response);
            } else {
                console.error(`${fLog}Context not found for action ${action}`);
                response.send({
                    fulfillmentText: `Something went wrong. Try in a few minutes`
                });
            }
        }
            break;
        case 'plot.chart': {
            const data_received = contexts.find(obj => {
                return obj.name === `${session}/contexts/data_received`;
            });
            const plot_chart = contexts.find(obj => {
                return obj.name === `${session}/contexts/plot_chart`;
            });

            if (data_received && plot_chart) {
                let fileLink = data_received.parameters.file_link;
                let test = parameters.CompositeTest.Test;
                let testAttr = parameters.CompositeTest.Attribute;
                let testOrig = plot_chart.parameters.CompositeTest['Test.original'];
                let attr = parameters.Attribute;
                let chart = parameters.Chart;
                if (!chart || chart === '') {
                    chart = 'barchart';
                }
                if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`)

                plotChart.plotChart(fileLink, chart, test, testAttr, testOrig, attr, null, null, response);

            }
        }
            break;
        default:
            console.log(`${fLog}No action matched`);
            response.send({
                fulfillmentText: `No action matched`
            });
    }
};


