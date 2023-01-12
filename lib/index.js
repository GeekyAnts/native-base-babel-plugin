"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var t = require("@babel/types");

var p = require("@babel/parser"); // const { default: generate } = require("@babel/generator");


var bundle = require(process.cwd() + "/node_modules/native-base/src/bundle");

var fs = require("fs");

var path = require("path"); // Utility functions
// function astNodeToString(node) {
//   return generate(node).code;
// }


function deleteIndexsofArray(arr, indexs) {
  var newArr = arr;

  for (var i = indexs.length - 1; i >= 0; i--) {
    newArr.splice(indexs[i], 1);
  }

  return newArr;
}

function createObjectJSXAttribute(key, value) {
  return t.jSXAttribute(t.jSXIdentifier(key), t.jSXExpressionContainer(value));
}

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
}

function astify(literal) {
  if (literal === null) {}

  switch (_typeof(literal)) {
    case "function":
      var ast = babylon.parse(literal.toString(), {
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true
      });
      return traverse.removeProperties(ast);

    case "number":
      return t.numericLiteral(literal);

    case "string":
      return t.stringLiteral(literal);

    case "boolean":
      return t.booleanLiteral(literal);

    case "undefined":
      return t.unaryExpression("void", t.numericLiteral(0), true);

    default:
      if (Array.isArray(literal)) {
        return t.arrayExpression(literal.map(astify));
      }

      return t.objectExpression(Object.keys(literal).filter(function (k) {
        return typeof literal[k] !== "undefined";
      }).map(function (k) {
        return t.objectProperty(t.stringLiteral(k), astify(literal[k]));
      }));
  }
} // function pbcopy(data) {
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

var doesItemsOfArrayContainsString = function doesItemsOfArrayContainsString(arr, str) {
  var flag = false;
  arr.forEach(function (item) {
    if (str.includes(item)) {
      flag = true;
    }
  });
  return flag;
};

module.exports = function (_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Program: function Program(path) {
        var filePath = this.file.opts.filename;

        if (!doesItemsOfArrayContainsString(["/node_modules/", "/build/", "/.next/"], filePath)) {
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
              if (!isEmptyObj(componentsList) && Object.keys(componentsList).includes(jsxOpeningElementPath.node.name.name)) {
                if (jsxOpeningElementPath.node.name.name === "NativeBaseProvider") {
                  if (jsxOpeningElementPath.node.attributes) {
                    jsxOpeningElementPath.node.attributes.push(createJSXAttributeNode("providerId", nextId("nbBootTime-")));
                  } else {
                    jsxOpeningElementPath.node.attributes = [createJSXAttributeNode("providerId", nextId("nbBootTime-"))];
                  }
                } else {
                  var attrs = jsxOpeningElementPath.node.attributes;
                  var componentAttrs = {};
                  var internalInlineStyleAttrs = {};
                  var indexToBeRemoved = [];
                  attrs.forEach(function (attr, ind) {
                    if (attr.type === "JSXSpreadAttribute" || !attr.value) {
                      return;
                    }

                    var isNBattr = ["colorScheme", "variant", "size"].includes(attr.name.name)

                    if (isNBattr) {
                      componentAttrs[attr.name.name] = attr.value.value;
                    }

                    if (!isNBattr && attr.value.type === "StringLiteral") {
                      internalInlineStyleAttrs[attr.name.name] = attr.value.value;
                      indexToBeRemoved.push(ind);
                    }

                    if (!isNBattr && attr.value.type === "JSXExpressionContainer" && attr.value.expression.type === "NumericLiteral") {
                      internalInlineStyleAttrs[attr.name.name] = attr.value.expression.value;
                      indexToBeRemoved.push(ind);
                    }
                  });
                  attrs = deleteIndexsofArray(attrs, indexToBeRemoved);

                  if (!isEmptyObj(internalInlineStyleAttrs)) {
                    var updatedInlineStyle = bundle.convertStyledProps({
                      theme: bundle.defaultTheme,
                      styledSystemProps: internalInlineStyleAttrs
                    }).styleFromProps;
                    jsxOpeningElementPath.node.attributes.push(createObjectJSXAttribute("INTERNAL_inlineStyle", astify(updatedInlineStyle)));
                  }

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
      }
    }
  };
};