import { TransactionStatus } from '../../shared/util/status';

export interface ReceiptData {
  orderId: string;
  transactionStatus: TransactionStatus;
  paymentTime: string | null;
  paymentMethod: string | null;
  paidAmount: number;
  billAmount: number | null;
  studentName: string | null;
  studentNisn: string | null;
  studentClass: string | null;
  periodMonth: number | null;
  periodYear: number | null;
  academicYear: string | null;
  semester: string | null;
  description: string | null;
  generatedAt: string;
}

export type ReceiptEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };

export interface ReceiptFile {
  blob: Blob;
  fileName: string;
}

export type ReceiptOutcome =
  | ({ status: 'ok' } & ReceiptFile)
  | { status: 'ineligible'; reason: string }
  | { status: 'error'; message: string };
