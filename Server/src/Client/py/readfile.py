import sys, json
import pandas as pd
from pandas.io.json import json_normalize 
import json
import csv
import io

def read_in():
    lines = sys.stdin.read()
    return lines;

def main():
    lines = read_in()

    stream = io.StringIO(lines, newline=None)
    csv_input = pd.read_csv(stream, sep=None, engine='python')
    dataset = csv_input.describe().to_json(orient='table')
    print(dataset)

# Start process
if __name__ == '__main__':
    main()