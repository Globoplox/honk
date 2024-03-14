const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/main.tsx',

  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    modules: ['node_modules'],
  },
  

  output: {
    filename: 'honk.js',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/i,
        type: 'asset/resource',
        generator: {
            filename: 'fonts/[name][ext][query]'
        }
      },

      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    }),
      
    new CopyPlugin({
      patterns: [
        "manifest.json",
        "*.css",
        {from: "icons", to: "icons"}
      ],
    }),
    
    new ZipPlugin({
      filename: 'honk',
    })
  ],  
};
