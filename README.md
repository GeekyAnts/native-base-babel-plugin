# @native-base/babel-plugin
Official Babel Plugin for NativeBase Build-Time theme resolution.

## Installation - 

Using yarn : 

```bash
yarn add -D @native-base/babel-plugin
```

Using npm : 

```bash
npm install --save-dev @native-base/babel-plugin
```

## Usage -
Simply add this plugin in your App's `babel.config.js` :
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [...YOUR_APP_PRESETS],
    plugins: ["@native-base/babel-plugin",...YOUR_OTHER_PLUGINS],
  };
};

```

## To setup the Development environment - 
- clone this Repo
- `yarn` or `npm install`
- `cd example && yarn && cd ..` or `cd example && npm install && cd ..`
- `yarn dev:web` or `npm run dev:web` to run the example app make your changes in `index.js`.
