const PythonShell = require('python-shell');
const DEV_CONFIG = (process.env.DEVELOPMENT_CONFIG == 'true');
const fLog = '[FULFILLMENT] ';

module.exports.plotChart = (fileLink, chart, test, testAttr, testOrig, attr, response) => {
    const options = {
        mode: 'text',
        scriptPath: 'Server/src/Python/',
        args: [`${fileLink}`, `${test}`, `${testAttr}`, `${testOrig}`, `${attr}`]
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