const webpack = require('webpack');

module.exports = {
  optimization: { minimize: false },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]
}