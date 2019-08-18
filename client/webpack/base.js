const webpack = require("webpack");
const dotenv = require('dotenv-webpack');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "eval-source-map",
    entry: "./client/src/index.js",
    output: {
        path: path.resolve(__dirname, "../public"),
        filename: "bundle.min.js"
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }]
        }, {
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }]
        }, {
            test: [/\.vert$/, /\.frag$/],
            use: "raw-loader"
        }, {
            test: /\.jsx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"]
                }
            }
        }, {
            test: /\.(gif|png|jpe?g|svg|xml|cur|mp3)$/i,
            use: "file-loader"
        },
        {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }]
    },
    devServer: {
        historyApiFallback: true,
    },
    plugins: [
        new dotenv({
            path: ".clientConfig",
            safe: true,
            silent: true
        }),
        new CleanWebpackPlugin(["public"], {
            root: path.resolve(__dirname, "./../")
        }),
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            template: "./client/index.html",
            filename: "index.html",
            inject: "body"
        })
    ]
};