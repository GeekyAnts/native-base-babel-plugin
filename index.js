const t = require("@babel/types");
const p = require("@babel/parser");
// const { default: generate } = require("@babel/generator");
const bundle = require(process.cwd() + "/node_modules/native-base/src/bundle");
const fs = require("fs");
const path = require("path");
// Utility functions
// function astNodeToString(node) {
//   return generate(node).code;
// }

function deleteIndexsofArray(arr, indexs) {
  let newArr = arr;
  for (var i = indexs.length - 1; i >= 0; i--) {
    newArr.splice(indexs[i], 1);
  }
  return newArr;
}

function createObjectJSXAttribute(key, value) {
  return t.jSXAttribute(t.jSXIdentifier(key), t.jSXExpressionContainer(value));
}
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
function astify(literal) {
  if (literal === null) {
  }
  switch (typeof literal) {
    case "function":
      const ast = babylon.parse(literal.toString(), {
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
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
      return t.objectExpression(
        Object.keys(literal)
          .filter((k) => {
            return typeof literal[k] !== "undefined";
          })
          .map((k) => {
            return t.objectProperty(t.stringLiteral(k), astify(literal[k]));
          })
      );
  }
}
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

const doesItemsOfArrayContainsString = (arr, str) => {
  let flag = false;
  arr.forEach((item) => {
    if (str.includes(item)) {
      flag = true;
    }
  });
  return flag;
};

module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const filePath = this.file.opts.filename;
        if (
          !doesItemsOfArrayContainsString(
            ["/node_modules/", "/build/", "/.next/"],
            filePath
          )
        ) {
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
                !isEmptyObj(componentsList) &&
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
                  let attrs = jsxOpeningElementPath.node.attributes;
                  const componentAttrs = {};
                  const internalInlineStyleAttrs = {};
                  let indexToBeRemoved = [];
                  attrs.map((attr, ind) => {
                    if (
                      attr.type !== "JSXSpreadAttribute" &&
                      ["colorScheme", "variant", "size"].includes(
                        attr.name.name
                      )
                    ) {
                      componentAttrs[attr.name.name] = attr.value.value;
                    }
                    if (
                      attr.type !== "JSXSpreadAttribute" &&
                      !["colorScheme", "variant", "size"].includes(
                        attr.name.name
                      ) &&
                      attr.value.type === "StringLiteral"
                    ) {
                      internalInlineStyleAttrs[attr.name.name] =
                        attr.value.value;
                      indexToBeRemoved.push(ind);
                    }
                    if (
                      attr.type !== "JSXSpreadAttribute" &&
                      !["colorScheme", "variant", "size"].includes(
                        attr.name.name
                      ) &&
                      attr.value.type === "JSXExpressionContainer" &&
                      attr.value.expression.type === "NumericLiteral"
                    ) {
                      internalInlineStyleAttrs[attr.name.name] =
                        attr.value.expression.value;
                      indexToBeRemoved.push(ind);
                    }
                  });
                  attrs = deleteIndexsofArray(attrs, indexToBeRemoved);
                  if (!isEmptyObj(internalInlineStyleAttrs)) {
                    const updatedInlineStyle = bundle.convertStyledProps({
                      theme: bundle.defaultTheme,
                      styledSystemProps: internalInlineStyleAttrs,
                    }).styleFromProps;
                    jsxOpeningElementPath.node.attributes.push(
                      createObjectJSXAttribute(
                        "INTERNAL_inlineStyle",
                        astify(updatedInlineStyle)
                      )
                    );
                  }
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
    },
  };
};
