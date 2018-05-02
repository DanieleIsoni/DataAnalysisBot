import pandas as pd
import sys

if len(sys.argv) > 1:
    url = sys.argv[1]
    data_set = pd.read_csv(url, sep=',', na_values=["?"])
    for i in list(data_set):
        print(i)