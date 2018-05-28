const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PROJECT_ID = process.env.PROJECT_ID;
const structjson = require('../../Client/Methods/structjson');
const fLog = '[FULFILLMENT] ';

module.exports.plotChart = (contexts, parameters, action, session, response) => {
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
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`);

        plotChartWrap(fileLink, chart, test, testAttr, testOrig, attr, null, null, response);

    }
};

module.exports.plotChartFuLabel = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const plot_chart = contexts.find(obj => {
        return obj.name === `${session}/contexts/plot_chart`;
    });
    const plotchart_followup_label = contexts.find(obj => {
        return obj.name === `${session}/contexts/plotchart-followup`;
    });
    let xlabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/xlabel`;
    });
    let ylabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/ylabel`;
    });

    if (data_received && plot_chart && plotchart_followup_label) {
        let fileLink = data_received.parameters.file_link;
        let test = plot_chart.parameters.CompositeTest.Test;
        let testAttr = plot_chart.parameters.CompositeTest.Attribute;
        let testOrig = plot_chart.parameters.CompositeTest['Test.original'];
        let attr = plot_chart.parameters.Attribute;
        let chart = plot_chart.parameters.Chart;
        let axis = plotchart_followup_label.parameters.Axis;
        if (axis === 'x'){
            xlabel = updateAxContext(axis, plotchart_followup_label.parameters, xlabel, session);
        } else if (axis === 'y'){
            ylabel = updateAxContext(axis, plotchart_followup_label.parameters, ylabel, session);
        }

        // let color = plotchart_followup_label.parameters.color === '' ? null : plotchart_followup_label.parameters.color;
        // let xLabelColor = axis === 'x' ? color : null;
        // let yLabelColor = axis === 'y' ? color : null;
        if (!chart || chart === '') {
            chart = 'barchart';
        }
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`);

        plotChartWrap(fileLink, chart, test, testAttr, testOrig, attr, xlabel, ylabel, response);

    }
};


let plotChartWrap = (fileLink, chart, test, testAttr, testOrig, attr, xLabel, yLabel, response) => {
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`, `${test}`, `${testAttr}`, `${testOrig}`, `${attr}`, `${xLabel}`, `${yLabel}`]
    };

    switch(chart) {
        case 'barchart': {
            PythonShell.run('barchart.py', options, (err, result) => {
                if (err) {
                    console.error(`${fLog}ERROR in PlotChart: ${err}`);
                }

                let codeToSend = `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import urllib
from io import BytesIO
import base64

    
try:
    data_set = pd.read_csv(${fileLink}, sep=',', na_values=["?"])


    x = {
        'maximum': data_set[[${attr}, ${testAttr}]].groupby(${attr}).agg([np.max]),
        'minimum': data_set[[${attr}, ${testAttr}]].groupby(${attr}).agg([np.min]),
        'mean': data_set[[${attr}, ${testAttr}]].groupby(${attr}).agg([np.mean]),
        'std': data_set[[${attr}, ${testAttr}]].groupby(${attr}).agg([np.std]),
        'var': data_set[[${attr}, ${testAttr}]].groupby(${attr}).agg([np.var])
    }.get(${test})

    testMod = {
        'maximum': 'max',
        'minimum': 'min',
        'mean': 'mean',
        'std': 'std',
        'var': 'var'
    }.get(${test})

    x.columns = x.columns.droplevel()

    # Define a function for a bar plot
    def barplot(x_data, y_data, x_label, y_label, title):
        _, ax = plt.subplots()
        # Draw bars, position them in the center of the tick mark on the x-axis
        ax.bar(x_data, y_data, color='#539caf', align='center')
            ax.set_ylabel(y_label)
            ax.set_xlabel(x_label)
            ax.set_title(title)
            
            
    barplot(x_data=x.index.values,
            y_data=x[testMod],
            x_label=${attr},
            y_label=${testOrig}+' '+${testAttr},
            title=${testOrig}+' '+${testAttr}+' per '+${attr})
                
    figfile = BytesIO()
    plt.savefig(figfile, format='png')
    figfile.seek(0)
    figdata_png = base64.b64encode(figfile.getvalue())
    print(figdata_png)


except urllib.error.HTTPError as err:
    if err.code == 404:
        print('ERROR: The provided url is unreachable')`;

                result = `${result}`.slice(2, `${result}`.length-1);

                let resToSend = {
                    fulfillmentText: 'Here is your chart:',
                    payload: {
                        code: codeToSend,
                        image: `${result}`
                    }
                };

                if (DEV_CONFIG) console.log(`${fLog}SENT RES: ${JSON.stringify(resToSend, null, '   ')}`);

                response.send(resToSend);

            });
        }
            break;
        default:
            const text = 'Chart not available try with another type of chart';
            console.warn(`${fLog}${text}`);
            response.send({
                fulfillmentText: text
            });
    }

};

let updateAxContext = (axis, params, label, session) => {
    /**
     * Label format:
     * {
     *      'family': 'serif',
     *      'color':  'darkred',
     *      'weight': 'normal',
     *      'size': 16,
     * }
     */

    let result = {};

    const dialogflow = require('dialogflow');

    const contextsClient = new dialogflow.ContextsClient({
        keyFileName: GOOGLE_APPLICATION_CREDENTIALS
    });

    let sessionId = session.split('/')[session.split('/').length-1];
    const sessionPath = contextsClient.sessionPath(PROJECT_ID, sessionId);

    let family = params.FontFamily;
    let color = params.color;

    if (label) {

        let contextPath = label.name;

        const getContextRequest = {
            name: contextPath
        };

        let res;

        result = contextsClient
            .getContext(getContextRequest)
            .then(responses => {
                const context = responses[0];

                const parametersJson = structjson.structProtoToJson(context.parameters);
                if (family) parametersJson.family = family;
                if (color) parametersJson.color = color;
                context.parameters = structjson.jsonToStructProto(parametersJson);

                const updateContextRequest = {
                    context: context
                };

                return contextsClient.updateContext(updateContextRequest);
            })
            .then(responses => {
                console.log(`Context updated: ${contextPath}`);
                if (DEV_CONFIG) console.log(`Context updated RESPONSE: ${responses[0]}`);
                return structjson.structProtoToJson(responses[0].parameters);
            })
            .catch(err => {
                console.error(`ERROR: ${err}`);
            });
    } else {
        const labelContextPath = contextsClient.contextPath(
            PROJECT_ID,
            sessionId,
            `${axis}label`
        );

        label = {
            parent: sessionPath,
            context: {
                name: labelContextPath,
                lifespanCount: 5,
                parameters: {}
            },
        };



        if (family) label.context.parameters.family = family;
        if (color) label.context.parameters.color = color;

        label.context.parameters = structjson.jsonToStructProto(label.context.parameters);

        result = contextsClient
            .createContext(label)
            .then(responses => {
                console.log(`Context created: ${labelContextPath}`);
                if (DEV_CONFIG) console.log(`Context created RESPONSE: ${JSON.stringify(responses[0], null, '   ')}`);
                return structjson.structProtoToJson(label.context.parameters)
            })
            .catch(err => {
                console.error(`ERROR: ${err}`);
            });

    }

    return result;
};