const webpack = require('webpack');

module.exports = {
  "presets": [
    "@babel/preset-env"
  ],
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]
}