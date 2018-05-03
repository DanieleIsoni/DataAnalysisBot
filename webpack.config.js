const webpack = require('webpack');

const config = {
    entry:  __dirname + '/React/js/index.js',
    output: {
        path: __dirname + '/React/dist',
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    module: {
        rules: [
          {
            test: /\.js?/,
            exclude: /node_modules/,
            use: 'babel-loader',
          }
        ]
      }
};

module.exports = config;