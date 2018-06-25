const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const PROJECT_ID = process.env.PROJECT_ID;
const PYPATH = process.env.PYPATH;
const fLog = '[FULFILLMENT] ';

module.exports.plotChart = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const plot_chart = contexts.find(obj => {
        return obj.name === `${session}/contexts/plot_chart`;
    });
    let xlabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/xlabel`;
    });
    let ylabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/ylabel`;
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

        if (xlabel) xlabel.lifespanCount = 5;
        if (ylabel) ylabel.lifespanCount = 5;
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`);

        plotChartPy(fileLink, chart, test, testAttr, testOrig, attr, xlabel, ylabel, response);

    }
};

module.exports.plotChartFuLabel = (contexts, parameters, action, session, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${session}/contexts/data_received`;
    });
    const plot_chart = contexts.find(obj => {
        return obj.name === `${session}/contexts/plot_chart`;
    });
    let xlabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/xlabel`;
    });
    let ylabel = contexts.find(obj => {
        return obj.name === `${session}/contexts/ylabel`;
    });

    if (data_received && plot_chart) {
        let fileLink = data_received.parameters.file_link;
        let test = plot_chart.parameters.CompositeTest.Test;
        let testAttr = plot_chart.parameters.CompositeTest.Attribute;
        let testOrig = plot_chart.parameters.CompositeTest['Test.original'];
        let attr = plot_chart.parameters.Attribute;
        let chart = plot_chart.parameters.Chart;
        let axis = plot_chart.parameters.Axis;
        if (axis === 'x'){
            xlabel = updateAxContext(axis, plot_chart.parameters, xlabel, session);
            if (!chart || chart === '') {
                chart = 'barchart';
            }
            if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`);

            plotChartPy(fileLink, chart, test, testAttr, testOrig, attr, xlabel, ylabel, response);
        } else if (axis === 'y'){
            ylabel = updateAxContext(axis, plot_chart.parameters, ylabel, session);

            if (!chart || chart === '') {
                chart = 'barchart';
            }
            if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chart}`);

            plotChartPy(fileLink, chart, test, testAttr, testOrig, attr, xlabel, ylabel, response);
        }

    }
};


let plotChartPy = (fileLink, chart, test, testAttr, testOrig, attr, xLabel, yLabel, response) => {

    let chartName = `${testOrig} of ${testAttr} by ${attr}`;
    let xLabelPy = null;
    let yLabelPy = null;
    if (xLabel != null) {
        xLabelPy = {};
        if (xLabel.parameters.color) xLabelPy.color = xLabel.parameters.color;
        if (xLabel.parameters.family) xLabelPy.family = xLabel.parameters.family;
        xLabelPy = `${JSON.stringify(xLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (xLabelPy === '[]') xLabelPy = null;
    }
    if (yLabel != null) {
        yLabelPy = {};
        if (yLabel.parameters.color) yLabelPy.color = yLabel.parameters.color;
        if (yLabel.parameters.family) yLabelPy.family = yLabel.parameters.family;
        yLabelPy = `${JSON.stringify(yLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (yLabelPy === '[]') yLabelPy = null;
    }

    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`, `${test}`, `${testAttr}`, `${testOrig}`, `${attr}`, xLabelPy, yLabelPy, chartName]
    };

    if (PYPATH)
        options.pythonPath = PYPATH;

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
                        image: `${result}`,
                        chartName: chartName
                    },
                    outputContexts: []
                };

                if (xLabel != null) {
                    xLabel.lifespanCount = 5;
                    resToSend.outputContexts.push(xLabel);
                }
                if (yLabel != null) {
                    yLabel.lifespanCount = 5;
                    resToSend.outputContexts.push(yLabel);
                }

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

    let sessionId = session.split('/')[session.split('/').length-1];

    let family = params.FontFamily;
    let color = params.Color;

    if (label) {
        label.lifespanCount = 5;

        if (family) label.parameters.family = family;
        if (color) label.parameters.color = color;

        return label;

    } else {
        const labelContextPath = `projects/${PROJECT_ID}/agent/sessions/${sessionId}/contexts/${axis}label`;

        label = {
            name: labelContextPath,
            lifespanCount: 5,
            parameters: {}
        };

        if (family) label.parameters.family = family;
        if (color) label.parameters.color = color;
        return label;

    }
};