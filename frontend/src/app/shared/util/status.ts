export type BillStatus = 'BELUM_LUNAS' | 'LUNAS';

export type TransactionStatus =
  | 'PENDING'
  | 'SETTLEMENT'
  | 'EXPIRE'
  | 'CANCEL'
  | 'DENY';

export type StatusTone = 'paid' | 'outstanding' | 'neutral' | 'danger';

const billLabels: Record<BillStatus, string> = {
  BELUM_LUNAS: 'Belum Lunas',
  LUNAS: 'Lunas',
};

const transactionLabels: Record<TransactionStatus, string> = {
  PENDING: 'Menunggu Pembayaran',
  SETTLEMENT: 'Lunas',
  EXPIRE: 'Kedaluwarsa',
  CANCEL: 'Dibatalkan',
  DENY: 'Ditolak',
};

const transactionTones: Record<TransactionStatus, StatusTone> = {
  PENDING: 'neutral',
  SETTLEMENT: 'paid',
  EXPIRE: 'neutral',
  CANCEL: 'neutral',
  DENY: 'danger',
};

const billTones: Record<BillStatus, StatusTone> = {
  BELUM_LUNAS: 'outstanding',
  LUNAS: 'paid',
};

export function billStatusLabel(status: BillStatus): string {
  return billLabels[status];
}

export function billStatusTone(status: BillStatus): StatusTone {
  return billTones[status];
}

export function transactionStatusLabel(status: TransactionStatus): string {
  return transactionLabels[status];
}

export function transactionStatusTone(status: TransactionStatus): StatusTone {
  return transactionTones[status];
}
