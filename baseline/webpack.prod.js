/*
 * vedi https://github.com/petehunt/webpack-howto
 *
 */

import merge from 'webpack-merge';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import common from './webpack.common.js';
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";

export default merge(common, {
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // set to true if you want JS source maps
        uglifyOptions: {
          ecma: 6
        },
        extractComments: true,
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }});
