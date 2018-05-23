import pandas as pd
import sys
import urllib

if len(sys.argv) > 1:
    url = sys.argv[1]
    try:
        data_set = pd.read_csv(url, sep=',', na_values=["?"])
        for i in list(data_set):
            print(i)
    except urllib.error.HTTPError as err:
        if err.code == 404:
            print('ERROR: The provided url is unreachable')
else:
    print('Missing parameters')