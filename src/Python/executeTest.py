import pandas as pd
import sys

if len(sys.argv) > 3:
    url = sys.argv[1]
    test_type = sys.argv[2]
    selected_attr = sys.argv[3]
    data_set = pd.read_csv(url, sep=',', na_values=["?"])
    result = {
        'maximum': data_set[selected_attr].max(),
        'minimum': data_set[selected_attr].min(),
        'mean': data_set[selected_attr].mean(),
        'std': data_set[selected_attr].std(),
        'var': data_set[selected_attr].var()
    }.get(test_type)

    if result:
        print(result)
    else:
        print('Something went wrong')
else:
    print('Missing parameters')


