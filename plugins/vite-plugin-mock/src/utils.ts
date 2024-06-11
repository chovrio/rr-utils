import * as ts from "typescript";

/**
 * 解析 TypeScript 文件并提取默认导出内容
 * @param filePath TypeScript 文件路径
 */
export function parseTypeScriptExports(filePath: string): any {
  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  const obj: Record<string, any> = {};
  if (!sourceFile) {
    throw new Error(`Could not read file: ${filePath}`);
  }

  let defaultExport: any;

  function visit(node: ts.Node) {
    if (ts.isExportAssignment(node)) {
      // 默认为 default 导出
      defaultExport = (node.expression as ts.Identifier).getText(sourceFile);
    }

    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (ts.isIdentifier(declaration.name)) {
          const varName = declaration.name.getText(sourceFile);
          const varValue = (declaration.initializer as ts.Expression).getText(
            sourceFile,
          );
          obj[varName] = varValue;
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return obj[defaultExport] || defaultExport;
}
