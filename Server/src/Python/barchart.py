import pandas as pd
import numpy as np
import urllib
import sys
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

if len(sys.argv) > 1:
    url = sys.argv[1]
    test = sys.argv[2]
    testAttr = sys.argv[3]
    testOrig = sys.argv[4]
    attr = sys.argv[5]

    try:
        data_set = pd.read_csv(url, sep=',', na_values=["?"])


        x = {
            'maximum': data_set[[attr, testAttr]].groupby(attr).agg([np.max]),
            'minimum': data_set[[attr, testAttr]].groupby(attr).agg([np.min]),
            'mean': data_set[[attr, testAttr]].groupby(attr).agg([np.mean]),
            'std': data_set[[attr, testAttr]].groupby(attr).agg([np.std]),
            'var': data_set[[attr, testAttr]].groupby(attr).agg([np.var])
        }.get(test)

        testMod = {
            'maximum': 'max',
            'minimum': 'min',
            'mean': 'mean',
            'std': 'std',
            'var': 'var'
        }.get(test)

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
                x_label=attr,
                y_label=testOrig+' '+testAttr,
                title=testOrig+' '+testAttr+' per '+attr)

        figfile = BytesIO()
        plt.savefig(figfile, format='png')
        figfile.seek(0)
        figdata_png = base64.b64encode(figfile.getvalue())
        print(figdata_png)

    except urllib.error.HTTPError as err:
        if err.code == 404:
            print('ERROR: The provided url is unreachable')
else:
    print('Missing parameters')
