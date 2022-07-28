"use strict";

var t = require("@babel/types");

var p = require("@babel/parser");

var bundle = require(process.cwd() + "/node_modules/native-base/src/bundle");

var fs = require("fs");

var path = require("path"); // Utility functions


function createJSXAttributeNode(name, value) {
  var providerIds = {};

  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    var data = fs.readFileSync(process.cwd() + "/.native-base/providerIds.json").toString("utf8");
    providerIds = JSON.parse(data);
  }

  providerIds[value] = true;
  var dirname = path.dirname(process.cwd() + "/.native-base/providerIds.json");

  if (fs.existsSync(dirname)) {
    fs.writeFileSync(process.cwd() + "/.native-base/providerIds.json", JSON.stringify(providerIds));
  } else {
    fs.mkdirSync(dirname);
    fs.writeFileSync(process.cwd() + "/.native-base/providerIds.json", JSON.stringify(providerIds));
  }

  return t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value));
} // function astify(literal) {
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

function nextId() {
  var _idMap;

  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "$lodash$";
  var providerIds = {};

  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    var data = fs.readFileSync(process.cwd() + "/.native-base/providerIds.json").toString("utf8");
    providerIds = JSON.parse(data);
  }

  var idMap = Object.keys(providerIds);
  var idMapMetaData = idMap.length === 0 ? "0" : (_idMap = idMap[(idMap === null || idMap === void 0 ? void 0 : idMap.length) - 1]) === null || _idMap === void 0 ? void 0 : _idMap.slice("-");
  var id = parseInt(idMapMetaData[(idMapMetaData === null || idMapMetaData === void 0 ? void 0 : idMapMetaData.length) - 1]) + 1;

  if (prefix === "$lodash$") {
    return "".concat(id);
  }

  return "".concat(prefix).concat(id);
}

var idCounter = {};
var componentsList = {};
var componentsMap = {};

var updateFile = function updateFile(platform, data) {
  bundle.generateBuildTimeMap(platform, data);
  var updatedResolvedStyledMap = {};
  var providerIds = {};

  if (fs.existsSync(process.cwd() + "/.native-base/providerIds.json")) {
    var _data = fs.readFileSync(process.cwd() + "/.native-base/providerIds.json").toString("utf8");

    providerIds = JSON.parse(_data);
  }

  Object.keys(providerIds).forEach(function (providerId) {
    var _bundle$resolvedStyle;

    updatedResolvedStyledMap[providerId] = (_bundle$resolvedStyle = bundle.resolvedStyledMap) === null || _bundle$resolvedStyle === void 0 ? void 0 : _bundle$resolvedStyle.generatedBuildTimeMap;
  });
  var modifiedData = "export default ".concat(JSON.stringify(updatedResolvedStyledMap, null, 2));
  fs.writeFileSync(process.cwd() + "/node_modules/native-base/lib/module/utils/map/index." + platform + ".js", modifiedData);
};

module.exports = function (_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Program: function Program(path) {
        var filePath = this.file.opts.filename; // if (
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
            ImportDeclaration: function ImportDeclaration(importPath) {
              if (importPath.node.source.value === "native-base") {
                if (importPath.node.specifiers) {
                  importPath.node.specifiers.map(function (specifier) {
                    if (specifier.imported) {
                      componentsList[specifier.imported.name] = true;
                    } else {
                      componentsList["allImport"] = true;
                    }
                  });
                }
              }
            }
          });
          path.traverse({
            JSXOpeningElement: function JSXOpeningElement(jsxOpeningElementPath) {
              if (Object.keys(componentsList).includes(jsxOpeningElementPath.node.name.name)) {
                if (jsxOpeningElementPath.node.name.name === "NativeBaseProvider") {
                  if (jsxOpeningElementPath.node.attributes) {
                    jsxOpeningElementPath.node.attributes.push(createJSXAttributeNode("providerId", nextId("nbBootTime-")));
                  } else {
                    jsxOpeningElementPath.node.attributes = [createJSXAttributeNode("providerId", nextId("nbBootTime-"))];
                  }
                } else {
                  var attrs = jsxOpeningElementPath.node.attributes;
                  var componentAttrs = {};
                  attrs.map(function (attr) {
                    if (attr.type === 'JSXSpreadAttribute') {
                      return;
                    }
                    
                    if (["colorScheme", "variant", "size"].includes(attr.name.name)) {
                      componentAttrs[attr.name.name] = attr.value.value;
                    }
                  });

                  if (!isEmptyObj(componentAttrs)) {
                    updateComponentMap(jsxOpeningElementPath.node.name.name, componentAttrs);
                  }
                }
              }
            }
          });
          updateFile("web", componentsMap);
          updateFile("ios", componentsMap);
          updateFile("android", componentsMap);
        }
      } // CallExpression(path) {
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

    }
  };
};
