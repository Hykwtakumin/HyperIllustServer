const webpack = require("webpack");
const TsConfigWebpackPlugin = require("ts-config-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const path = require("path");
const nodeEnv = process.env.NODE_ENV;

const plugins = [
  new TsConfigWebpackPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
];

if (nodeEnv === "stats") plugins.push(new BundleAnalyzerPlugin());

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: path.resolve(__dirname, "src/client/index.tsx"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public/dist/")
  },
  watch: nodeEnv !== "production",
  plugins,
  resolve: {
    alias: {
      "moment-with-locale": path.resolve(
        __dirname,
        "src/client/utils/momentWithLocale.ts"
      )
    }
  }
};
