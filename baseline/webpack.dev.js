/*
 * vedi https://github.com/petehunt/webpack-howto
 *
 */
var webpack = require('webpack');
var path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    }
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.HotModuleReplacementPlugin() // Enable HMR
    //, new BundleAnalyzerPlugin()
	],
});
