const path = require('path')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const { DefinePlugin, ProvidePlugin } = require('webpack')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

const ESLintPlugin = require('eslint-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/ui/index.html',
  filename: './index.html',
  excludeChunks: ['inject', 'inpage', 'background'],
})

const isProd = process.env.NODE_ENV === 'production'
const manifestV3 = process.env.MANIFEST_VERSION === 'v3'

module.exports = {
  entry: {
    main: './src/ui',
    inject: './src/content',
    inpage: './src/inpage',
    background: './src/background',
  },
  performance: {
    hints: false,
  },
  devtool: isProd ? 'source-map' : 'inline-source-map',
  mode: isProd ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {},
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|txt)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx', // Or 'ts' if you don't need tsx
          target: 'es2015',
        },
      },
    ],
  },
  plugins: [
    htmlPlugin,
    new CopyPlugin({
      patterns: [
        {
          from: `./manifest/${manifestV3 ? 'v3' : 'v2'}.json`,
          to: 'manifest.json',
        },
        { from: './src/assets', to: 'assets' },
      ],
    }),
    new DefinePlugin({
      'process.env.VERSION': JSON.stringify(process.env.npm_package_version),
    }),
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      React: 'react',
    }),

    !isProd && // eslint should run before the build starts
      new ESLintPlugin({
        extensions: ['ts', 'tsx'],
        fix: true,
        threads: true,
      }),

    new ForkTsCheckerWebpackPlugin(), // does the type checking in a separate process (non-blocking in dev) as esbuild is skipping type checking

    new Dotenv({
      systemvars: true,
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { buffer: require.resolve('buffer/') },
    plugins: [new TsConfigPathsPlugin()],
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  optimization: isProd
    ? {
        minimize: true,
        minimizer: [
          new ESBuildMinifyPlugin({
            target: 'es2015', // Syntax to compile to (see options below for possible values)
            loader: 'tsx',
          }),
        ],
        splitChunks: {
          chunks: 'async',
        },
      }
    : undefined,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: 'sourcemaps/[file].map',
  },
}
