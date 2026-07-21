import { reconcilePersistedSecurityFindings } from "../lib/dekoclean/securityReconciliation.ts";
console.log(JSON.stringify(reconcilePersistedSecurityFindings(), null, 2));
