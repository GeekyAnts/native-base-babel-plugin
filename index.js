const t = require("@babel/types");
const p = require("@babel/parser");
const bundle = require("./node_modules/native-base/src/bundle");

// Utility functions
const findVariableDeclarationFromIdentifierName = (path, name) => {
  const variableDeclaration = path.findParent((p) => {
    if (p.node.type === "VariableDeclaration") {
      p.traverse({
        Identifier(path) {
          if (path.node.name === name) {
            return true;
          }
        },
      });
    }
    return false;
  });
  if (variableDeclaration) {
    const variableDeclarator = variableDeclaration
      .get("declarations")
      .find((declarator) => {
        return declarator.get("id").node.name === name;
      });
    if (variableDeclarator) {
      return variableDeclarator;
    }
  }
  return null;
};
function astify(literal) {
  if (literal === null) {
    return t.nullLiteral();
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
function pbcopy(data) {
  var proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(data);
  proc.stdin.end();
}
function isEmptyObj(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
function updateComponentMap(component, propArray) {
  if (!componentsMap[component]) {
    componentsMap[component] = [];
  }
  componentsMap[component]?.push(propArray);
}
let componentsList = {};
let componentsMap = {};

module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const filePath = this.file.opts.filename;
        if (
          filePath.includes("/node_modules/native-base/lib/module/index.js")
        ) {
          path.traverse({
            ImportDeclaration(importPath) {
              importPath.insertBefore([
                t.importDeclaration(
                  [
                    t.importSpecifier(
                      t.identifier("init"),
                      t.identifier("init")
                    ),
                  ],
                  t.stringLiteral("./core/ResolvedStyleMap")
                ),
                t.expressionStatement(
                  t.callExpression(t.identifier("init"), [
                    astify(bundle.resolvedStyledMap),
                  ])
                ),
              ]);
              importPath.stop();
            },
          });
        } else {
          path.traverse({
            ImportDeclaration(importPath) {
              if (importPath.node.source.value === "native-base") {
                importPath.node.specifiers?.map((specifier) => {
                  if (specifier.imported) {
                    componentsList[specifier.imported.name] = true;
                  } else {
                    componentsList["allImport"] = true;
                  }
                });
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
                const attrs = jsxOpeningElementPath.node.attributes;
                const componentAttrs = {};
                attrs.map((attr) => {
                  if (
                    ["colorScheme", "variant", "size"].includes(attr.name.name)
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
            },
          });
        }
        bundle.generateBuildTimeMap("web", componentsMap);
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
