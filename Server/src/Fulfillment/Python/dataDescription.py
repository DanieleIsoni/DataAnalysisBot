import pandas as pd
import sys
import numpy as np
import urllib

if len(sys.argv) > 1:
    if sys.argv[1] != 'null':
        url = sys.argv[1]
    else:
        url = None

    if sys.argv[2] != 'null':
        divider = sys.argv[2]
    else:
        divider = None

    try:
        data_set = pd.read_csv(url, sep=divider, na_values=["?"])
        for el in data_set:
            print(el)
            if data_set[el].dtype == np.int64 or data_set[el].dtype == np.float64:
                print(data_set[el].describe().apply(lambda x: format(x, 'f')))
            else:
                print(data_set[el].describe())
    except urllib.error.HTTPError as err:
        if err.code == 404:
            print('ERROR: The provided url is unreachable')
else:
    print('Missing parameters')
