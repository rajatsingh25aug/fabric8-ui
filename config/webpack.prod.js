/**
 * @author: @AngularClass
 */
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const branding = require('./branding');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const stringify = require('json-stringify');

/**
 * Webpack Plugins
 */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
// const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
// const ProvidePlugin = require('webpack/lib/ProvidePlugin');
// const ngtools = require('@ngtools/webpack');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const OfflinePlugin = require('offline-plugin');


/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const FABRIC8_FORGE_API_URL = process.env.FABRIC8_FORGE_API_URL;
const FABRIC8_FEATURE_TOGGLES_API_URL = process.env.FABRIC8_FEATURE_TOGGLES_API_URL;
const FABRIC8_WIT_API_URL = process.env.FABRIC8_WIT_API_URL;
const FABRIC8_REALM = process.env.FABRIC8_REALM;
const FABRIC8_RECOMMENDER_API_URL = process.env.FABRIC8_RECOMMENDER_API_URL || 'http://api-bayesian.dev.rdu2c.fabric8.io/api/v1/';
const FABRIC8_SSO_API_URL = process.env.FABRIC8_SSO_API_URL;
const FABRIC8_AUTH_API_URL = process.env.FABRIC8_AUTH_API_URL;
const FABRIC8_FORGE_URL = process.env.FORGE_URL;
const FABRIC8_PIPELINES_NAMESPACE = process.env.FABRIC8_PIPELINES_NAMESPACE;
const FABRIC8_JENKINS_API_URL = process.env.FABRIC8_JENKINS_API_URL;
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
const BUILD_NUMBER = process.env.BUILD_NUMBER;
const BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP;
const BUILD_VERSION = process.env.BUILD_VERSION;
const FABRIC8_BRANDING = process.env.FABRIC8_BRANDING || 'fabric8';

const ANALYTICS_RECOMMENDER_URL = process.env.ANALYTICS_RECOMMENDER_URL;
const ANALYTICS_LICENSE_URL = process.env.ANALYTICS_LICENSE_URL;

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge(commonConfig({ env: ENV }).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false,
  FABRIC8_FORGE_API_URL: FABRIC8_FORGE_API_URL,
  FABRIC8_FEATURE_TOGGLES_API_URL: FABRIC8_FEATURE_TOGGLES_API_URL,
  FABRIC8_WIT_API_URL: FABRIC8_WIT_API_URL,
  FABRIC8_REALM: FABRIC8_REALM,
  FABRIC8_SSO_API_URL: FABRIC8_SSO_API_URL,
  FABRIC8_AUTH_API_URL: FABRIC8_AUTH_API_URL,
  FABRIC8_RECOMMENDER_API_URL: FABRIC8_RECOMMENDER_API_URL,
  FABRIC8_FORGE_URL: FABRIC8_FORGE_URL,
  FABRIC8_PIPELINES_NAMESPACE: FABRIC8_PIPELINES_NAMESPACE,
  FABRIC8_JENKINS_API_URL: FABRIC8_JENKINS_API_URL,
  PUBLIC_PATH: PUBLIC_PATH,
  BUILD_NUMBER: BUILD_NUMBER,
  BUILD_TIMESTAMP: BUILD_TIMESTAMP,
  BUILD_VERSION: BUILD_VERSION,
  FABRIC8_BRANDING: FABRIC8_BRANDING,
  ANALYTICS_RECOMMENDER_URL: ANALYTICS_RECOMMENDER_URL,
  ANALYTICS_LICENSE_URL: ANALYTICS_LICENSE_URL
});

module.exports = function (env) {
  // stringify can't cope with undefined
  console.log('The env from the webpack.prod config: ' + (env ? stringify(env, null, 2) : env));
  console.log('The merged metadata:', METADATA);
  return webpackMerge({
    plugins: [
      /**
       * Plugin: HashedModuleIdsPlugin
       * Description: This plugin will cause hashes to be based on the relative path of the module,
       * generating a four character string as the module id.
       * Prevents busting the cache prematurely due to default internal module ID generation.
       *
       * See: https://webpack.js.org/plugins/hashed-module-ids-plugin/
       */
      new webpack.HashedModuleIdsPlugin(),
    ]
  },

  commonConfig({ env: ENV }),

  {

    /**
     * As of Webpack 4 we need to set the mode.
     */
    mode: 'production',

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */

    // PROD VALUE
    devtool: 'source-map',

    // DEBUG VALUE
    //devtool: 'inline-source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),
      // path: path.join(process.cwd(), 'dist'),
      publicPath: METADATA.PUBLIC_PATH,

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '_assets/lib/[name].[chunkhash:8].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '_assets/lib/[name].[chunkhash:8].bundle.map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '_assets/lib/[name].[chunkhash:8].chunk.js',
    },

    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            parse: {
              // we want uglify-js to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
          sourceMap: true,
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'src/config',
          to: 'config'
        }
      ]),

      /**
       * Plugin: @ngtools/webpack
       * Description: Set up AoT for webpack, including SASS precompile
       */
      /*     new ngtools.AotPlugin({
       tsConfigPath: 'tsconfig-aot.json',
       // mainPath: "src/main.browser.ts"
       // entryModule: 'src/app/app.module#AppModule',
       // genDir: 'aot'
     }),
*/

      /**
       * Webpack plugin and CLI utility that represents bundle content as convenient interactive zoomable treemap
       */
      /*
            new BundleAnalyzerPlugin({
              generateStatsFile: true
            }),
      */

      /**
       * Plugin: DedupePlugin
       * Description: Prevents the inclusion of duplicate code into your bundle
       * and instead applies a copy of the function at runtime.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       * See: https://github.com/webpack/docs/wiki/optimization#deduplication
       */
      // new DedupePlugin(), // see: https://github.com/angular/angular-cli/issues/1587

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': stringify(METADATA.ENV),
          'NODE_ENV': stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
          'FABRIC8_FORGE_API_URL': stringify(METADATA.FABRIC8_FORGE_API_URL),
          'FABRIC8_FEATURE_TOGGLES_API_URL': stringify(METADATA.FABRIC8_FEATURE_TOGGLES_API_URL),
          'FABRIC8_WIT_API_URL': stringify(METADATA.FABRIC8_WIT_API_URL),
          'FABRIC8_REALM': stringify(METADATA.FABRIC8_REALM),
          'FABRIC8_SSO_API_URL': stringify(METADATA.FABRIC8_SSO_API_URL),
          'FABRIC8_AUTH_API_URL': stringify(METADATA.FABRIC8_AUTH_API_URL),
          'FABRIC8_RECOMMENDER_API_URL': stringify(METADATA.FABRIC8_RECOMMENDER_API_URL),
          'FABRIC8_FORGE_URL': stringify(METADATA.FABRIC8_FORGE_URL),
          'FABRIC8_PIPELINES_NAMESPACE': stringify(METADATA.FABRIC8_PIPELINES_NAMESPACE),
          'FABRIC8_JENKINS_API_URL': stringify(METADATA.FABRIC8_JENKINS_API_URL),
          'PUBLIC_PATH': stringify(METADATA.PUBLIC_PATH),
          'BUILD_NUMBER': stringify(METADATA.BUILD_NUMBER),
          'BUILD_TIMESTAMP': stringify(METADATA.BUILD_TIMESTAMP),
          'BUILD_VERSION': stringify(METADATA.BUILD_VERSION),
          'FABRIC8_BRANDING': stringify(METADATA.FABRIC8_BRANDING),
          'ANALYTICS_RECOMMENDER_URL': stringify(METADATA.ANALYTICS_RECOMMENDER_URL),
          'ANALYTICS_LICENSE_URL': stringify(METADATA.ANALYTICS_LICENSE_URL)
        }
      }),

      /*
       * Generate FavIcons from the master svg in all formats
       */
      new FaviconsWebpackPlugin({
        logo: branding.assets[METADATA.FABRIC8_BRANDING].favicon.path,
        prefix: '_assets/icons-[hash]/'
      }),

      /**
       * Plugin: NormalModuleReplacementPlugin
       * Description: Replace resources that matches resourceRegExp with newResource
       *
       * See: http://webpack.github.io/docs/list-of-plugins.html#normalmodulereplacementplugin
       */

      new NormalModuleReplacementPlugin(
        /angular2-hmr/,
        helpers.root('config/modules/angular2-hmr-prod.js')
      ),

      /**
       * Plugin: IgnorePlugin
       * Description: Don’t generate modules for requests matching the provided RegExp.
       *
       * See: http://webpack.github.io/docs/list-of-plugins.html#ignoreplugin
       */

      // new IgnorePlugin(/angular2-hmr/),

      /**
       * Plugin: CompressionPlugin
       * Description: Prepares compressed versions of assets to serve
       * them with Content-Encoding
       *
       * See: https://github.com/webpack/compression-webpack-plugin
       */
      //  install compression-webpack-plugin
      // new CompressionPlugin({
      //   regExp: /\.css$|\.html$|\.js$|\.map$/,
      //   threshold: 2 * 1024
      // })

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new LoaderOptionsPlugin({
        debug: false,
        minimize: true,
        options: {

          /**
           * Html loader advanced options
           *
           * See: https://github.com/webpack/html-loader#advanced-options
           */
          // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
          htmlLoader: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          }
        }
      }),

      // this turns on Service Workers, but it is currently cause us to have to hard refresh twice to see any change in production
      //   therefore we are turning it off for now.
      // OfflinePlugin always goes last
/*
      new OfflinePlugin()
*/

    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  });
};
