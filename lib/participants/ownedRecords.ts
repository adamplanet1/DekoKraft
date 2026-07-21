import type { ParticipantId } from "./types";

export interface ParticipantOwnedRecord {
  participantId: ParticipantId;
}

export interface ParticipantOrderRecord extends ParticipantOwnedRecord {
  id: string;
  customerId?: string;
  productIds: string[];
  createdAt: string;
  status: string;
}

export interface ParticipantCustomerRecord extends ParticipantOwnedRecord {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
}

export interface ParticipantInvoiceRecord extends ParticipantOwnedRecord {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: string;
}
