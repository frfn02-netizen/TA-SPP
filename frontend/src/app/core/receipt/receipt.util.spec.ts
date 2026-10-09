import { HttpErrorResponse } from '@angular/common/http';
import { Tagihan } from '../tagihan/tagihan.model';
import { Transaksi } from '../transaksi/transaksi.model';
import {
  buildReceiptData,
  evaluateReceiptEligibility,
  formatReceiptDate,
  mapReceiptFetchError,
  receiptFileName,
} from './receipt.util';

function makeTransaksi(overrides: Partial<Transaksi> = {}): Transaksi {
  return {
    id: 1,
    tagihan_id: 10,
    order_id: 'SPP-20250910-ABCDEF',
    gross_amount: '150000.00',
    transaction_status: 'SETTLEMENT',
    payment_type: 'qris',
    snap_token: null,
    payment_url: null,
    transaction_time: '2025-09-10T08:00:00.000Z',
    settlement_time: '2025-09-10T08:05:00.000Z',
    paid_at: '2025-09-10T08:05:30.000Z',
    midtrans_response: null,
    created_at: '2025-09-10T08:00:00.000Z',
    updated_at: '2025-09-10T08:05:30.000Z',
    ...overrides,
  };
}

function makeTagihan(overrides: Partial<Tagihan> = {}): Tagihan {
  return {
    id: 10,
    siswa_id: 1,
    tahun_ajaran_id: 1,
    bulan: 9,
    tahun: 2025,
    nominal: '150000.00',
    jatuh_tempo: '2025-09-10',
    status: 'LUNAS',
    keterangan: 'SPP September',
    created_at: '',
    updated_at: '',
    nama: 'Budi Santoso',
    nisn: '1234567890',
    tingkat: 'X',
    jurusan: 'RPL',
    tahun_ajaran: '2025/2026',
    semester: 'GANJIL',
    ...overrides,
  };
}

describe('evaluateReceiptEligibility', () => {
  it('allows a SETTLEMENT transaction with a LUNAS bill', () => {
    expect(
      evaluateReceiptEligibility(makeTransaksi(), makeTagihan()),
    ).toEqual({ eligible: true });
  });

  it('rejects a PENDING transaction', () => {
    const result = evaluateReceiptEligibility(
      makeTransaksi({ transaction_status: 'PENDING' }),
      makeTagihan({ status: 'BELUM_LUNAS' }),
    );
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain('menunggu pembayaran');
    }
  });

  it('rejects EXPIRE and CANCEL transactions', () => {
    for (const status of ['EXPIRE', 'CANCEL'] as const) {
      const result = evaluateReceiptEligibility(
        makeTransaksi({ transaction_status: status }),
        makeTagihan({ status: 'BELUM_LUNAS' }),
      );
      expect(result.eligible).toBe(false);
    }
  });

  it('rejects inconsistent data (SETTLEMENT but bill not LUNAS)', () => {
    const result = evaluateReceiptEligibility(
      makeTransaksi(),
      makeTagihan({ status: 'BELUM_LUNAS' }),
    );
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain('belum LUNAS');
    }
  });
});

describe('buildReceiptData', () => {
  it('maps fields from the API transaction and bill', () => {
    const data = buildReceiptData(makeTransaksi(), makeTagihan(), new Date('2025-10-01T00:00:00Z'));

    expect(data.orderId).toBe('SPP-20250910-ABCDEF');
    expect(data.transactionStatus).toBe('SETTLEMENT');
    expect(data.paidAmount).toBe(150000);
    expect(data.billAmount).toBe(150000);
    expect(data.studentName).toBe('Budi Santoso');
    expect(data.studentNisn).toBe('1234567890');
    expect(data.studentClass).toBe('X RPL');
    expect(data.periodMonth).toBe(9);
    expect(data.periodYear).toBe(2025);
    expect(data.academicYear).toBe('2025/2026');
    expect(data.semester).toBe('Ganjil');
    expect(data.paymentMethod).toBe('QRIS');
    expect(data.paymentTime).toBe('2025-09-10T08:05:00.000Z');
    expect(data.generatedAt).toBe('2025-10-01T00:00:00.000Z');
  });

  it('falls back for payment time: paid_at then transaction_time', () => {
    const withPaidAt = buildReceiptData(
      makeTransaksi({ settlement_time: null }),
      makeTagihan(),
    );
    expect(withPaidAt.paymentTime).toBe('2025-09-10T08:05:30.000Z');

    const withTransactionTime = buildReceiptData(
      makeTransaksi({ settlement_time: null, paid_at: null }),
      makeTagihan(),
    );
    expect(withTransactionTime.paymentTime).toBe('2025-09-10T08:00:00.000Z');
  });

  it('keeps optional fields null when data is missing', () => {
    const data = buildReceiptData(
      makeTransaksi({ payment_type: null, settlement_time: null, paid_at: null, transaction_time: null }),
      makeTagihan({
        nisn: undefined,
        tingkat: undefined,
        jurusan: undefined,
        tahun_ajaran: undefined,
        semester: undefined,
        keterangan: null,
        nominal: undefined as unknown as string,
      }),
    );

    expect(data.paymentMethod).toBeNull();
    expect(data.paymentTime).toBeNull();
    expect(data.studentNisn).toBeNull();
    expect(data.studentClass).toBeNull();
    expect(data.academicYear).toBeNull();
    expect(data.semester).toBeNull();
    expect(data.description).toBeNull();
    expect(data.billAmount).toBeNull();
  });
});

describe('receiptFileName', () => {
  it('builds a safe file name from the order id', () => {
    expect(receiptFileName('SPP-20250910-ABCDEF')).toBe(
      'struk-SPP-20250910-ABCDEF.pdf',
    );
  });

  it('sanitizes unsafe characters', () => {
    expect(receiptFileName('SPP-2025/0910 ABC::1')).toBe(
      'struk-SPP-20250910ABC1.pdf',
    );
  });

  it('falls back when the order id is empty', () => {
    expect(receiptFileName('')).toBe('struk-SPP-transaksi.pdf');
  });
});

describe('formatReceiptDate', () => {
  it('formats a timestamp in WIB with an Indonesian month name', () => {
    expect(formatReceiptDate('2025-07-05T01:00:05.000Z')).toBe(
      '05 Juli 2025, 08.00 WIB',
    );
  });

  it('returns an empty string for missing or invalid values', () => {
    expect(formatReceiptDate(null)).toBe('');
    expect(formatReceiptDate(undefined)).toBe('');
    expect(formatReceiptDate('bukan-tanggal')).toBe('');
  });
});

describe('mapReceiptFetchError', () => {
  it('maps HTTP status to safe Indonesian messages', () => {
    expect(mapReceiptFetchError(new HttpErrorResponse({ status: 401 }))).toContain(
      'Sesi Anda berakhir',
    );
    expect(mapReceiptFetchError(new HttpErrorResponse({ status: 403 }))).toContain(
      'tidak memiliki akses',
    );
    expect(mapReceiptFetchError(new HttpErrorResponse({ status: 404 }))).toContain(
      'tidak ditemukan',
    );
    expect(mapReceiptFetchError(new HttpErrorResponse({ status: 500 }))).toContain(
      'tidak dapat dimuat',
    );
  });
});
