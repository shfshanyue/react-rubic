const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = {
  entry: {
    app: './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, './components')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.(scss|sass)$/,
        loaders: ['style?insertAt=top&singleton', 'css', 'postcss', 'sass']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: '[name].[ext]'
        }
      }
    ]
  },
  postcss() {
    return Array.of(autoprefixer)
  },
  devtool: 'source-map',
  devServer: {
    port: '8888',
    host: '0.0.0.0'
  }
}
