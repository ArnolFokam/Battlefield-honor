const merge = require("webpack-merge");
const path = require("path");
const base = require("./base");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = merge(base, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../public"),
    filename: "bundle.min.js"
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  plugins: [
    new CompressionWebpackPlugin({
            filename: '[path].gz',
            compressionOptions: { level: 9 },
            algorithm: 'gzip',
            test: /\.(js)$/,
            minRatio: 0.8
        })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  }
});
