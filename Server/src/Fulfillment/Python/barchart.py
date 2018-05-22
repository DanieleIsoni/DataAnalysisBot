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
    if sys.argv[1] != 'null':
        url = sys.argv[1]
    else:
        url = None

    if sys.argv[2] != 'null':
        test = sys.argv[2]
    else:
        test = None

    if sys.argv[3] != 'null':
        testAttr = sys.argv[3]
    else:
        testAttr = None

    if sys.argv[4] != 'null':
        testOrig = sys.argv[4]
    else:
        testOrig = None

    if sys.argv[5] != 'null':
        attr = sys.argv[5]
    else:
        attr = None

    if sys.argv[6] != 'null':
        xLabelColor = sys.argv[6]
    else:
        xLabelColor = None

    if sys.argv[7] != 'null':
        yLabelColor = sys.argv[6]
    else:
        yLabelColor = None

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
        def barplot(x_data, y_data, x_label, y_label, title, xlabel_color, ylabel_color):
            _, ax = plt.subplots()
            # Draw bars, position them in the center of the tick mark on the x-axis
            ax.bar(x_data, y_data, color='#539caf', align='center')
            ax.set_title(title)

            x_font = {}
            y_font = {}

            if xlabel_color is not None:
                x_font.color = xlabel_color
            if ylabel_color is not None:
                y_font.color = ylabel_color

            ax.set_xlabel(xlabel=x_label, fontdict=x_font)
            ax.set_ylabel(ylabel=y_label, fontdict=y_font)

        barplot(x_data=x.index.values,
                y_data=x[testMod],
                x_label=attr,
                y_label=testOrig+' '+testAttr,
                title=testOrig+' '+testAttr+' per '+attr,
                xlabel_color=xLabelColor,
                ylabel_color=yLabelColor)

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
