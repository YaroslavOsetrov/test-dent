const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const fs = require('fs');

const resolveTsconfigPathsToAlias = require('./webpack.resolve');
/**
 * This is a server config which should be merged on top of common config
 */
module.exports = {
  entry: {  
    server: './server.ts', 
    prerender: './prerender.ts',
    api:'./api.ts'
  },
  resolve: { 
    extensions: ['.ts', '.js'],
    alias: resolveTsconfigPathsToAlias({
	    tsconfigPath: './tsconfig.json', // Using custom path
	    webpackConfigBasePath: './src/', // Using custom path
    }),
 },
  optimization:{
        minimize: false
  },
  target: 'node',
  // this makes sure we include node_modules and other 3rd party libraries
  externals: [nodeExternals({
      // this WILL include `jquery` and `webpack/hot/dev-server` in the bundle, as well as `lodash/*`
      whitelist: [
        'tedious', 
        'app-root-dir', 
        'recaptcha2', 
        'fs', 
        'emailjs', 
        'ladda',
        'spin.js',
        //'formidable',
        /^angular2-ladda/,
        /^ngx-mask/,
        /^@ngx-universal/,  
        /^@ngx-translate/, 
        /^ngx-bootstrap/, 
        /^sweetalert/, 
        'urlencode', 
        'validator', 
       // 'stripe', 
        'moment',
        'randomstring', 
        'jsonschema', 
        'xmlbuilder', 
        'jimp', 
        'azure-storage'
      ]
  })],
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ]
  },
  plugins: [
    // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
    // for "WARNING Critical dependency: the request of a dependency is an expression"
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
    )
  ]
}