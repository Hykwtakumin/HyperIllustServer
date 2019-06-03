const TsConfigWebpackPlugin = require("ts-config-webpack-plugin");
const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: path.resolve(__dirname, "src/client/index.tsx"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public/dist/")
  },
  plugins: [new TsConfigWebpackPlugin()]
};
