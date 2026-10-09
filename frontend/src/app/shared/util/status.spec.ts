import {
  billStatusLabel,
  billStatusTone,
  transactionStatusLabel,
  transactionStatusTone,
} from './status';

describe('status mapping', () => {
  it('translates bill statuses to Indonesian', () => {
    expect(billStatusLabel('BELUM_LUNAS')).toBe('Belum Lunas');
    expect(billStatusLabel('LUNAS')).toBe('Lunas');
  });

  it('translates transaction statuses to Indonesian', () => {
    expect(transactionStatusLabel('PENDING')).toBe('Menunggu Pembayaran');
    expect(transactionStatusLabel('SETTLEMENT')).toBe('Lunas');
    expect(transactionStatusLabel('EXPIRE')).toBe('Kedaluwarsa');
    expect(transactionStatusLabel('CANCEL')).toBe('Dibatalkan');
    expect(transactionStatusLabel('DENY')).toBe('Ditolak');
  });

  it('maps transaction statuses to visual tones', () => {
    expect(transactionStatusTone('SETTLEMENT')).toBe('paid');
    expect(transactionStatusTone('PENDING')).toBe('neutral');
    expect(transactionStatusTone('DENY')).toBe('danger');
  });

  it('maps bill statuses to visual tones', () => {
    expect(billStatusTone('LUNAS')).toBe('paid');
    expect(billStatusTone('BELUM_LUNAS')).toBe('outstanding');
  });
});
