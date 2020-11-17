module.exports = {
  mode: 'development',
  entry: ["./src/scripts/app.js"],
  output: {
    path: __dirname + "/dist/scripts",
    filename: "app.js",
  },
  devtool: "sourcemap",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!app-js)/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
