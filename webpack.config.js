const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Analize = process.env.npm_config_analize

module.exports = {
	entry: {
		app: path.resolve(__dirname, 'src/main.tsx'),
	},
	output: {
		path: path.resolve(__dirname, 'static'),
		filename: 'js/[name].js',
		publicPath: '/'
	},
	mode: 'production',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		fallback: {
			fs: false,
			path: false,
			crypto: false
		}
	},
	plugins: [
		Analize ? new BundleAnalyzerPlugin() : '',
		new MiniCssExtractPlugin({ filename: 'css/[name].css' })
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /(node_modules|\.webpack)/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
				]
			},
			{
				test: /\.js$/,
				// exclude any files under the node_modules directory
				exclude: /node_modules/,
				use: {
					// use the babel-loader
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					}
				}
			}
		]
	},
	stats: {
		errorDetails: true
	},

	optimization: {
		splitChunks: {
			chunks: 'all',
			minSize: 0,
			cacheGroups: {
				JsonData: {
					test: /\.json$/,
					name: 'json',
					priority: 10,
					enforce: true,
					chunks: 'all',
				}

			},
			name: 'app'
		}
	},
	devtool: 'source-map'
}
