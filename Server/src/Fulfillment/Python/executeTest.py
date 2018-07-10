import pandas as pd
import sys
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

    if sys.argv[3] != 'null':
        test_type = sys.argv[3]
    else:
        test_type = None

    if sys.argv[4] != 'null':
        selected_attr = sys.argv[4]
    else:
        selected_attr = None

    try:
        data_set = pd.read_csv(url, sep=divider, na_values=["?"])

        result = {
            'maximum': data_set[selected_attr].max(),
            'minimum': data_set[selected_attr].min(),
            'mean': data_set[selected_attr].mean(),
            'std': data_set[selected_attr].std(),
            'var': data_set[selected_attr].var()
        }.get(test_type)

        print(result)

    except urllib.error.HTTPError as err:
        if err.code == 404:
            print('ERROR: The provided url is unreachable')
else:
    print('Missing parameters')


