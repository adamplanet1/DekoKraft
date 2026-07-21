import type { SellerProduct } from "../../data/sellerProducts";
import { normalizeParticipantId } from "../../../lib/participants/types";
export function sellerOwnsProduct(participantId: string, product: SellerProduct): boolean { return Boolean(participantId) && normalizeParticipantId(product) === participantId; }
