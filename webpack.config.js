const webpackConfig = {
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]
}