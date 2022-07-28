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
Also in dev env you will have to delete the cache generated on your root in the folder .native-base .
You can simply add `rm -rf .native-base` in your dev script.

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "other-scripts":"yarn something",
    "dev": "rm -rf .native-base && yarn start",
  }
```

## To setup the Development environment - 
- clone this Repo
- `yarn` or `npm install`
- `cd example && yarn && cd ..` or `cd example && npm install && cd ..`
- `yarn dev:web` or `npm run dev:web` to run the example app make your changes in `index.js`.
