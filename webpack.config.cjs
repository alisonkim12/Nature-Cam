const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './public/js/get-cams.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.d\.ts$/,
        use: 'ignore-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
    fallback: {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      module: false,
      buffer: require.resolve('buffer/'),
      assert: require.resolve('assert/'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      querystring: require.resolve('querystring-es3'),
      vm: require.resolve('vm-browserify'),
      url: require.resolve('url/'),
      string_decoder: require.resolve('string_decoder/'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['bundle.js'], // Only delete bundle.js
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^worker_threads$/,
    }),
    new NodePolyfillPlugin(),
  ],
  mode: 'development',
};
