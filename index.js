const t = require("@babel/types");
const p = require("@babel/parser");
const bundle = require(process.cwd() + "/node_modules/native-base/src/bundle");
const fs = require("fs");
const path = require("path");

// Utility functions
function createJSXAttributeNode(name, value) {
  let providerIds = {};
  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    const data = fs
      .readFileSync(process.cwd() + "/.native-base/providerIds.json")
      .toString("utf8");
    providerIds = JSON.parse(data);
  }
  providerIds[value] = true;
  var dirname = path.dirname(process.cwd() + "/.native-base/providerIds.json");
  if (fs.existsSync(dirname)) {
    fs.writeFileSync(
      process.cwd() + "/.native-base/providerIds.json",
      JSON.stringify(providerIds)
    );
  } else {
    fs.mkdirSync(dirname);
    fs.writeFileSync(
      process.cwd() + "/.native-base/providerIds.json",
      JSON.stringify(providerIds)
    );
  }
  return t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value));
}
// function astify(literal) {
//   if (literal === null) {
//   }
//   switch (typeof literal) {
//     case "function":
//       const ast = babylon.parse(literal.toString(), {
//         allowReturnOutsideFunction: true,
//         allowSuperOutsideMethod: true,
//       });
//       return traverse.removeProperties(ast);
//     case "number":
//       return t.numericLiteral(literal);
//     case "string":
//       return t.stringLiteral(literal);
//     case "boolean":
//       return t.booleanLiteral(literal);
//     case "undefined":
//       return t.unaryExpression("void", t.numericLiteral(0), true);
//     default:
//       if (Array.isArray(literal)) {
//         return t.arrayExpression(literal.map(astify));
//       }
//       return t.objectExpression(
//         Object.keys(literal)
//           .filter((k) => {
//             return typeof literal[k] !== "undefined";
//           })
//           .map((k) => {
//             return t.objectProperty(t.stringLiteral(k), astify(literal[k]));
//           })
//       );
//   }
// }
// function pbcopy(data) {
//   var proc = require("child_process").spawn("pbcopy");
//   proc.stdin.write(data);
//   proc.stdin.end();
// }
function isEmptyObj(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
function updateComponentMap(component, propArray) {
  if (!componentsMap[component]) {
    componentsMap[component] = [];
  }
  if (componentsMap[component]) {
    componentsMap[component].push(propArray);
  }
}

function nextId(prefix = "$lodash$") {
  let providerIds = {};
  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    const data = fs
      .readFileSync(process.cwd() + "/.native-base/providerIds.json")
      .toString("utf8");
    providerIds = JSON.parse(data);
  }
  const idMap = Object.keys(providerIds);
  const idMapMetaData =
    idMap.length === 0 ? "0" : idMap[idMap?.length - 1]?.slice("-");
  let id = parseInt(idMapMetaData[idMapMetaData?.length - 1]) + 1;

  if (prefix === "$lodash$") {
    return `${id}`;
  }

  return `${prefix}${id}`;
}

const idCounter = {};
let componentsList = {};
let componentsMap = {};
const updateFile = (platform, data) => {
  bundle.generateBuildTimeMap(platform, data);
  let updatedResolvedStyledMap = {};
  let providerIds = {};
  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    const data = fs
      .readFileSync(process.cwd() + "/.native-base/providerIds.json")
      .toString("utf8");
    providerIds = JSON.parse(data);
  }
  Object.keys(providerIds).forEach((providerId) => {
    updatedResolvedStyledMap[providerId] =
      bundle.resolvedStyledMap?.generatedBuildTimeMap;
  });
  const modifiedData = `export default ${JSON.stringify(
    updatedResolvedStyledMap,
    null,
    2
  )}`;
  fs.writeFileSync(
    process.cwd() +
      "/node_modules/native-base/lib/module/utils/map/index." +
      platform +
      ".js",
    modifiedData
  );
};
module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const filePath = this.file.opts.filename;
        // if (
        //   filePath.includes("/node_modules/native-base/lib/module/index.js")
        // ) {
        //   path.traverse({
        //     ImportDeclaration(importPath) {
        //       importPath.insertBefore([
        //         t.importDeclaration(
        //           [
        //             t.importSpecifier(
        //               t.identifier("init"),
        //               t.identifier("init")
        //             ),
        //           ],
        //           t.stringLiteral("./utils/styled")
        //         ),
        //         t.expressionStatement(
        //           t.callExpression(t.identifier("init"), [
        //             astify(bundle.resolvedStyledMap),
        //           ])
        //         ),
        //       ]);
        //       importPath.stop();
        //     },
        //   });
        // } else {
        if (!filePath.includes("/node_modules/")) {
          path.traverse({
            ImportDeclaration(importPath) {
              if (importPath.node.source.value === "native-base") {
                if (importPath.node.specifiers) {
                  importPath.node.specifiers.map((specifier) => {
                    if (specifier.imported) {
                      componentsList[specifier.imported.name] = true;
                    } else {
                      componentsList["allImport"] = true;
                    }
                  });
                }
              }
            },
          });
          path.traverse({
            JSXOpeningElement(jsxOpeningElementPath) {
              if (
                Object.keys(componentsList).includes(
                  jsxOpeningElementPath.node.name.name
                )
              ) {
                if (
                  jsxOpeningElementPath.node.name.name === "NativeBaseProvider"
                ) {
                  if (jsxOpeningElementPath.node.attributes) {
                    jsxOpeningElementPath.node.attributes.push(
                      createJSXAttributeNode(
                        "providerId",
                        nextId("nbBootTime-")
                      )
                    );
                  } else {
                    jsxOpeningElementPath.node.attributes = [
                      createJSXAttributeNode(
                        "providerId",
                        nextId("nbBootTime-")
                      ),
                    ];
                  }
                } else {
                  const attrs = jsxOpeningElementPath.node.attributes;
                  const componentAttrs = {};
                  attrs.map((attr) => {
                    if (
                      ["colorScheme", "variant", "size"].includes(
                        attr.name.name
                      )
                    ) {
                      componentAttrs[attr.name.name] = attr.value.value;
                    }
                  });
                  if (!isEmptyObj(componentAttrs)) {
                    updateComponentMap(
                      jsxOpeningElementPath.node.name.name,
                      componentAttrs
                    );
                  }
                }
              }
            },
          });
          updateFile("web", componentsMap);
          updateFile("ios", componentsMap);
          updateFile("android", componentsMap);
        }
      },
      // CallExpression(path) {
      //   if (
      //     path.node.callee.name === 'init'
      //     //  &&
      //     // t.isIdentifier(path.parent.id, {
      //     //   name: 'resolvedStyledMap',
      //     // })
      //   ) {
      //     // path.replaceWith(astify(testObj));
      //     console.log(JSON.stringify(path.node.left, null, 2));
      //     pbcopy(JSON.stringify(path.parent, null, 2));
      //   }
      // },
    },
  };
};
