const nativebasePlugin = require("../index");
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [nativebasePlugin],
  };
};
