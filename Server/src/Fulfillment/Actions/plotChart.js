const Common = require('../../Common');
const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const PROJECT_ID = process.env.PROJECT_ID;
const fLog = '[FULFILLMENT] ';

module.exports.plotChart = (contexts, parameters, action, sessionPath, sessionId, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/data_received`;
    });
    const plot_chart = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/plot_chart`;
    });

    if (data_received && plot_chart) {
        let session = Common.sessions.get(sessionId);

        let fileLink = session.variablesMap.get(session.variable).variableLink;
        let test = parameters.CompositeTest.Test;
        let testAttr = parameters.CompositeTest.Attribute;
        let testOrig = plot_chart.parameters.CompositeTest['Test.original'];
        let attr = parameters.Attribute;
        let chartType = parameters.Chart;
        if (!chartType || chartType === '') {
            chartType = 'barchart';
        }

        let chartName = `chart${session.chartCount+1}`;

        let chart = {
            name: chartName,
            test: `${test}`,
            testAttr: `${testAttr}`,
            attr: `${attr}`,
            testOrig: `${testOrig}`,
            chartType: `${chartType}`
        };

        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chartType}`);

        if (session.variablesMap.get(session.variable).attributes.includes(testAttr)
            && session.variablesMap.get(session.variable).attributes.includes(attr)) {
            chart.variable = session.variable;
            plotChartPy(fileLink, chart, response, sessionId);
        } else {
            response.send({
                fulfillmentText: `The attribute you selected is not in the chosen dataset, try selecting the correct dataset`
            });
        }

    }
};

module.exports.plotChartFuLabel = (contexts, parameters, action, sessionPath, sessionId, response) => {
    const data_received = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/data_received`;
    });
    const plot_chart = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/plot_chart`;
    });

    if (data_received && plot_chart) {
        let session = Common.sessions.get(sessionId);
        let axis = plot_chart.parameters.Axis;
        let family = plot_chart.parameters.FontFamily;
        let color = plot_chart.parameters.Color;

        let chartName = plot_chart.parameters.ChartName;

        let chart = session.charts.find(obj => {
            return obj.name === `${chartName}`;
        });

        if (chart) {
            let fileLink = session.variablesMap.get(session.variable).variableLink;
            if (axis === 'x') {
                if (!chart.xLabel){
                    chart.xLabel = {};
                }
                if (family) chart.xLabel.family = family;
                if (color) chart.xLabel.color = color;
                if (DEV_CONFIG) console.log(`${fLog}Chosen test: ${chart.test} on ${chart.testAttr}\nChosen attribute for x-axis: ${chart.attr}\nChosen chart: ${chart.chartType}`);

                plotChartPy(fileLink, chart, response, sessionId);
            } else if (axis === 'y') {
                if (!chart.yLabel){
                    chart.yLabel = {};
                }
                if (family) chart.yLabel.family = family;
                if (color) chart.yLabel.color = color;
                if (DEV_CONFIG) console.log(`${fLog}Chosen test: ${chart.test} on ${chart.testAttr}\nChosen attribute for x-axis: ${chart.attr}\nChosen chart: ${chart.chartType}`);

                plotChartPy(fileLink, chart, response, sessionId);
            }
        } else {
            response.send({
                fulfillmentText: `The attribute you selected is not in the chosen dataset, try selecting the correct dataset`
            });
        }

    }
};


let plotChartPy = (fileLink, chart, response, sessionId) => {

    let session = Common.sessions.get(sessionId);

    let xLabelPy = null;
    let yLabelPy = null;
    if (chart.xLabel) {
        xLabelPy = chart.xLabel;
        xLabelPy = `${JSON.stringify(xLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (xLabelPy === '[]') xLabelPy = null;
    }
    if (chart.yLabel) {
        yLabelPy = chart.yLabel;
        yLabelPy = `${JSON.stringify(yLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (yLabelPy === '[]') yLabelPy = null;
    }

    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        args: [`${fileLink}`, `${chart.test}`, `${chart.testAttr}`, `${chart.testOrig}`, `${chart.attr}`, xLabelPy, yLabelPy, `${chart.name}`]
    };

    switch(`${chart.chartType}`) {
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
        'maximum': data_set[[${chart.attr}, ${chart.testAttr}]].groupby(${chart.attr}).agg([np.max]),
        'minimum': data_set[[${chart.attr}, ${chart.testAttr}]].groupby(${chart.attr}).agg([np.min]),
        'mean': data_set[[${chart.attr}, ${chart.testAttr}]].groupby(${chart.attr}).agg([np.mean]),
        'std': data_set[[${chart.attr}, ${chart.testAttr}]].groupby(${chart.attr}).agg([np.std]),
        'var': data_set[[${chart.attr}, ${chart.testAttr}]].groupby(${chart.attr}).agg([np.var])
    }.get(${chart.test})

    testMod = {
        'maximum': 'max',
        'minimum': 'min',
        'mean': 'mean',
        'std': 'std',
        'var': 'var'
    }.get(${chart.test})

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
            x_label=${chart.attr},
            y_label=${chart.testOrig}+' '+${chart.testAttr},
            title=${chart.name})
                
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
                        chartName: `${chart.name}`
                    },
                };

                if (result != 'define'){

                    let cId = session.charts.findIndex(el => {
                        return el.name === chart.name;
                    });

                    if (cId=== -1) {
                        session.charts.push(chart);
                        session.chartCount++;
                    } else {
                        session.charts[cId] = chart;
                    }
                    console.log(`Charts: ${JSON.stringify(session.charts, null, '   ')}`);
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