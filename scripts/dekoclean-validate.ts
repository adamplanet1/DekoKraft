import { validateDekoCleanOperation } from "../lib/dekoclean/validation.ts";

const result = await validateDekoCleanOperation();
console.log(JSON.stringify({
  operationId: result.operationId,
  lintPassed: result.lintPassed,
  buildPassed: result.buildPassed,
  diffCheckPassed: result.diffCheckPassed,
  integrityPassed: result.integrityPassed,
}, null, 2));
if (!result.lintPassed || !result.buildPassed || !result.diffCheckPassed || !result.integrityPassed) process.exitCode = 1;
