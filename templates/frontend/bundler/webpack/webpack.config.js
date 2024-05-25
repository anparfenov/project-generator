import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

function isDev() {
	return process.env.NODE_ENV === "development";
}

const config = {
	mode: process.env.NODE_ENV ?? "development",
	entry: "./src/entry.tsx",
	module: {
		rules: [
			{
				test: /.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [isDev() ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "[name].[contenthash].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "assets/template.html",
		}),
	],
};

export default config;
