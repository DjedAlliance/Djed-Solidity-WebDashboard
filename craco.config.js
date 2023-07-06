const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push(".wasm");
      webpackConfig.experiments = {
        asyncWebAssembly: true,
        topLevelAwait: true,
        layers: true
      };
      webpackConfig.resolve.alias = {
        "react/jsx-runtime": require.resolve("react/jsx-runtime")
      };
      webpackConfig.devServer = {
        overlay: {
          warnings: true,
          errors: true
        }
      };
      webpackConfig.resolve.fallback = {
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify")
      };
      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.type === "asset/resource") {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"]
        })
      );

      return webpackConfig;
    }
  }
};
