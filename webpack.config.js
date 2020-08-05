const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/),
    new webpack.IgnorePlugin(/^mongodb-client-encryption$/)
  ]
}