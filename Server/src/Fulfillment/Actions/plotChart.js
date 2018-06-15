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
    // let xlabel = contexts.find(obj => {
    //     return obj.name === `${sessionPath}/contexts/xlabel`;
    // });
    // let ylabel = contexts.find(obj => {
    //     return obj.name === `${sessionPath}/contexts/ylabel`;
    // });

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

        /** start new things */
        let chartName = `chart${session.chartCount+1}`;

        let chart = {
            name: chartName,
            test: `${test}`,
            testAttr: `${testAttr}`,
            attr: `${attr}`,
            testOrig: `${testOrig}`,
            chartType: `${chartType}`
        };
        /** end new things */

        // if (xlabel) xlabel.lifespanCount = 5;
        // if (ylabel) ylabel.lifespanCount = 5;
        if(DEV_CONFIG) console.log(`${fLog}Chosen test: ${test} on ${testAttr}\nChosen attribute for x-axis: ${attr}\nChosen chart: ${chartType}`);

        if (session.variablesMap.get(session.variable).attributes.includes(testAttr)
            && session.variablesMap.get(session.variable).attributes.includes(attr)) {
            chart.variable = session.variable;
            plotChartPy(fileLink, /*chartType, test, testAttr, testOrig, attr, xlabel, ylabel,*/chart, response, sessionId);
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
    const plotchart_followup_label = contexts.find(obj => {
        return obj.name === `${sessionPath}/contexts/plotchart-followup`;
    });
    // let xlabel = contexts.find(obj => {
    //     return obj.name === `${sessionPath}/contexts/xlabel`;
    // });
    // let ylabel = contexts.find(obj => {
    //     return obj.name === `${sessionPath}/contexts/ylabel`;
    // });

    if (data_received && plot_chart && plotchart_followup_label) {
        let session = Common.sessions.get(sessionId);
        // let fileLink = session.variablesMap.get(session.variable).variableLink;
        //let test = plot_chart.parameters.CompositeTest.Test;
        //let testAttr = plot_chart.parameters.CompositeTest.Attribute;
        //let testOrig = plot_chart.parameters.CompositeTest['Test.original'];
        // let attr = plot_chart.parameters.Attribute;
        //let chartType = plot_chart.parameters.Chart;
        let axis = plotchart_followup_label.parameters.Axis;
        let family = plotchart_followup_label.parameters.FontFamily;
        let color = plotchart_followup_label.parameters.Color;

        /** start new */
        let chartName = plotchart_followup_label.parameters.ChartName;

        let chart = session.charts.find(obj => {
            return obj.name === `${chartName}`;
        });
        /** end new*/

        if (chart) {
            let fileLink = session.variablesMap.get(session.variable).variableLink;
            if (axis === 'x') {
                if (!chart.xLabel){
                    chart.xLabel = {};
                }
                if (family) chart.xLabel.family = family;
                if (color) chart.xLabel.color = color;
                // xlabel = updateAxContext(axis, plotchart_followup_label.parameters, xlabel, sessionPath);
                //
                // if (!chartType || chartType === '') {
                //     chartType = 'barchart';
                // }
                if (DEV_CONFIG) console.log(`${fLog}Chosen test: ${chart.test} on ${chart.testAttr}\nChosen attribute for x-axis: ${chart.attr}\nChosen chart: ${chart.chartType}`);

                plotChartPy(fileLink, /*chartType, test, testAttr, testOrig, attr, xlabel, ylabel,*/chart, response, sessionId);
            } else if (axis === 'y') {
                if (!chart.yLabel){
                    chart.yLabel = {};
                }
                if (family) chart.yLabel.family = family;
                if (color) chart.yLabel.color = color;
                // ylabel = updateAxContext(axis, plotchart_followup_label.parameters, ylabel, sessionPath);
                //
                // if (!chartType || chartType === '') {
                //     chartType = 'barchart';
                // }
                if (DEV_CONFIG) console.log(`${fLog}Chosen test: ${chart.test} on ${chart.testAttr}\nChosen attribute for x-axis: ${chart.attr}\nChosen chart: ${chart.chartType}`);

                plotChartPy(fileLink, /*chartType, test, testAttr, testOrig, attr, xlabel, ylabel,*/chart, response, sessionId);
            }
        } else {
            response.send({
                fulfillmentText: `The attribute you selected is not in the chosen dataset, try selecting the correct dataset`
            });
        }

    }
};


let plotChartPy = (fileLink, /*chartType, test, testAttr, testOrig, attr, xLabel, yLabel,*/chart, response, sessionId) => {

    let session = Common.sessions.get(sessionId);

    /*
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
    */

    /** start new */
    let xLabelPy = null;
    let yLabelPy = null;
    if (chart.xLabel) {
        xLabelPy = chart.xLabel;
        // if (chart.xLabel.color) xLabelPy.color = xLabel.color;
        // if (chart.xLabel.family) xLabelPy.family = xLabel.family;
        xLabelPy = `${JSON.stringify(xLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (xLabelPy === '[]') xLabelPy = null;
    }
    if (chart.yLabel) {
        yLabelPy = chart.yLabel;
        // if (chart.yLabel.color) yLabelPy.color = yLabel.color;
        // if (chart.yLabel.family) yLabelPy.family = yLabel.family;
        yLabelPy = `${JSON.stringify(yLabelPy)}`.replace(':', ': ').replace('{', '[').replace('}', ']');
        if (yLabelPy === '[]') yLabelPy = null;
    }
    /** end new */

    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Fulfillment/Python/',
        //args: [`${fileLink}`, `${test}`, `${testAttr}`, `${testOrig}`, `${attr}`, xLabelPy, yLabelPy]
        args: [`${fileLink}`, `${chart.test}`, `${chart.testAttr}`, `${chart.testOrig}`, `${chart.attr}`, xLabelPy, yLabelPy]
    };

    switch(/*chartType*/ `${chart.chartType}`) {
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
            title=${chart.testOrig}+' '+${chart.testAttr}+' per '+${chart.attr})
                
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
                    },
                    //outputContexts: []
                };

                /*
                if (xLabel != null) {
                    xLabel.lifespanCount = 5;
                    resToSend.outputContexts.push(xLabel);
                }
                if (yLabel != null) {
                    yLabel.lifespanCount = 5;
                    resToSend.outputContexts.push(yLabel);
                }
                */
                if (result != 'define'){
                    session.chartCount++;
                    let cId = session.charts.findIndex(el => {
                        return el.name === chart.name;
                    });

                    if (cId=== -1) {
                        session.charts.push(chart);
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

let updateAxContext = (axis, params, label, sessionPath) => {
    /**
     * Label format:
     * {
     *      'family': 'serif',
     *      'color':  'darkred',
     *      'weight': 'normal',
     *      'size': 16,
     * }
     */

    let sessionId = sessionPath.split('/')[sessionPath.split('/').length-1];

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