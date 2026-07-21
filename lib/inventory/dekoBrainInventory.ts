import { getDekoBrainInventoryContext } from "./inventoryStore";

/**
 * Read-only inventory boundary for browser-side DekoBrain services.
 * Inventory mutations intentionally remain behind participant confirmation APIs.
 */
export const readInventoryForDekoBrain = (participantId: string) => getDekoBrainInventoryContext(participantId);

