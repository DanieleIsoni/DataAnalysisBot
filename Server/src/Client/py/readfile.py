import sys
import pandas as pd
import io


def read_in():
    lines = sys.stdin.read()
    return lines


def main():
    lines = read_in()

    stream = io.StringIO(u""+lines, newline=None)
    csv_input = pd.read_csv(stream, sep=None, engine='python')
    dataset = csv_input.describe().to_json(orient='table')
    print(dataset)


# Start process
if __name__ == '__main__':
    main()
