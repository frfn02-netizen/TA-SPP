import { BillStatus, TransactionStatus } from '../../shared/util/status';

export interface Transaksi {
  id: number;
  tagihan_id: number;
  order_id: string;
  gross_amount: string;
  transaction_status: TransactionStatus;
  payment_type: string | null;
  snap_token: string | null;
  payment_url: string | null;
  transaction_time: string | null;
  settlement_time: string | null;
  paid_at: string | null;
  midtrans_response: unknown;
  created_at: string;
  updated_at: string;
  nama?: string;
  nisn?: string;
  bulan?: number;
  tahun?: number;
  nominal?: string;
  status?: BillStatus;
}

export interface TransaksiCreatePayload {
  tagihanId: number;
}

export interface TransaksiCreateResult {
  id: number;
  orderId: string;
  transactionStatus: TransactionStatus;
  snapToken: string;
  paymentUrl: string;
}
