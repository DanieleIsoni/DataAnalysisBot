import pandas as pd
import sys
import urllib

if len(sys.argv) > 2:
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
        for i in list(data_set):
            print(i)
    except urllib.error.HTTPError as err:
        if err.code == 404:
            print('ERROR: The provided url is unreachable')
else:
    print('Missing parameters')
