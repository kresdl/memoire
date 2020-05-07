require('dotenv').config();

Array.prototype.trim = function() {
	return this.filter(Boolean);
};

const webpack = require('webpack'),
HtmlWebpackPlugin = require('html-webpack-plugin'),
{ resolve } = require('path');

module.exports = ({ development: dev = false } = {}) => {
  const ext = dev ? 'js' : 'min.js',
    { PUBLIC_URL: publicPath = '/', 
      OUTPUT_PATH: outputPath = 'build' } = process.env; 

	return {
		mode: dev ? 'development' : 'production',
		devtool: dev ? 'eval-source-map' : undefined,
		context: resolve('src'),
		entry: './index.js',

		devServer: {
			contentBase: resolve('build'),
			port: 8081,
			hot: true,
			host: 'localhost',
		},

		module: {
			rules: [
				{
					test: /\.js$/i,
					exclude: /node_modules/,
					use: {
            loader: 'babel-loader',
            options: {
              presets: [
                !dev && [
                  '@babel/preset-env',
                  {
                    targets: '> 0.25%, not dead',
                    useBuiltIns: 'usage',
                    corejs: 3
                  }
                ]
              ]
            }
          }
				}, {
					test: /\.s?css$/i,
					use: [
						'style-loader', 'css-loader', 'sass-loader'
					]
				}, {
					test: /\.(png|jpe?g|bmp|svg|obj|glsl)$/i,
					use: {
						loader: 'url-loader',
						options: {
							name: '[path][name].[hash].[ext]',
							limit: 4096,
							publicPath
						}
					}
				}, {
					test: /\.html$/i,
					use: 'html-loader'
				}
			]
		},

		output: {
      publicPath,
			path: resolve(outputPath),
			filename: `index.bundle.${ext}`,
			pathinfo: false
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: `./index.html`,
				filename: `./index.html`
			}),
			dev && new webpack.HotModuleReplacementPlugin()
		].trim()
	};
};
