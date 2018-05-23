const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
          },
          {
              test: /\.css$/,
              use: [ 'style-loader', 'css-loader' ]
          }
        ]
      },
      plugins: [
        new webpack.optimize.AggressiveMergingPlugin()
      ],
      optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                  compress: true,
                  ecma: 6,
                  mangle: true
                },
                sourceMap: false
              })
        ]
      },
};

module.exports = config;