const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './index.js',
  output: {
    filename: 'honk.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              ['@babel/plugin-transform-react-jsx', {
                runtime: 'classic',
                pragma: 'this.jsx'
              }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        "manifest.json",
        "*.css",
        {from: "icons", to: "icons"},
        {from: "index.html", to: "honk.html"}
      ],
    }),
    new ZipPlugin({
      filename: 'honk',
    })
  ],  
};
