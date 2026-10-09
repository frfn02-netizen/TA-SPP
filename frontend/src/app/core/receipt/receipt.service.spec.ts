import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Tagihan } from '../tagihan/tagihan.model';
import { TagihanService } from '../tagihan/tagihan.service';
import { Transaksi } from '../transaksi/transaksi.model';
import { TransaksiService } from '../transaksi/transaksi.service';
import { ReceiptOutcome } from './receipt.model';
import { ReceiptPdfService } from './receipt-pdf.service';
import { ReceiptService } from './receipt.service';

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
    paid_at: '2025-09-10T08:05:00.000Z',
    midtrans_response: null,
    created_at: '2025-09-10T08:00:00.000Z',
    updated_at: '2025-09-10T08:05:00.000Z',
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

interface Setup {
  service: ReceiptService;
  buildPdf: ReturnType<typeof vi.fn>;
  transaksiIds: number[];
}

function setup(overrides: {
  transaksi?: () => Observable<Transaksi>;
  tagihan?: () => Observable<Tagihan>;
} = {}): Setup {
  const transaksiIds: number[] = [];
  const buildPdf = vi.fn(() =>
    Promise.resolve({
      blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
      fileName: 'struk-SPP-20250910-ABCDEF.pdf',
    }),
  );

  TestBed.configureTestingModule({
    providers: [
      ReceiptService,
      {
        provide: TransaksiService,
        useValue: {
          getById: (id: number) => {
            transaksiIds.push(id);
            return overrides.transaksi
              ? overrides.transaksi()
              : of(makeTransaksi());
          },
        },
      },
      {
        provide: TagihanService,
        useValue: {
          getById: overrides.tagihan ?? (() => of(makeTagihan())),
        },
      },
      { provide: ReceiptPdfService, useValue: { buildPdf } },
    ],
  });

  return { service: TestBed.inject(ReceiptService), buildPdf, transaksiIds };
}

function run(service: ReceiptService, id: number): Promise<ReceiptOutcome> {
  return firstValueFrom(service.generate(id));
}

describe('ReceiptService', () => {
  it('builds a PDF for a settled transaction with a LUNAS bill', async () => {
    const { service, buildPdf, transaksiIds } = setup();
    const outcome = await run(service, 1);

    expect(outcome.status).toBe('ok');
    if (outcome.status === 'ok') {
      expect(outcome.fileName).toBe('struk-SPP-20250910-ABCDEF.pdf');
      expect(outcome.blob.size).toBeGreaterThan(0);
    }
    expect(buildPdf).toHaveBeenCalledTimes(1);
    expect(transaksiIds).toEqual([1]);
  });

  it('returns ineligible for a PENDING transaction without building a PDF', async () => {
    const { service, buildPdf } = setup({
      transaksi: () => of(makeTransaksi({ transaction_status: 'PENDING' })),
      tagihan: () => of(makeTagihan({ status: 'BELUM_LUNAS' })),
    });
    const outcome = await run(service, 1);

    expect(outcome.status).toBe('ineligible');
    expect(buildPdf).not.toHaveBeenCalled();
  });

  it('returns ineligible when transaction and bill status are inconsistent', async () => {
    const { service, buildPdf } = setup({
      transaksi: () => of(makeTransaksi({ transaction_status: 'SETTLEMENT' })),
      tagihan: () => of(makeTagihan({ status: 'BELUM_LUNAS' })),
    });
    const outcome = await run(service, 1);

    expect(outcome.status).toBe('ineligible');
    expect(buildPdf).not.toHaveBeenCalled();
  });

  it('maps a transaction fetch error (404) to a safe message', async () => {
    const { service } = setup({
      transaksi: () => throwError(() => new HttpErrorResponse({ status: 404 })),
    });
    const outcome = await run(service, 99);

    expect(outcome.status).toBe('error');
    if (outcome.status === 'error') {
      expect(outcome.message).toContain('tidak ditemukan');
    }
  });

  it('maps a tagihan fetch error (403) to a safe message', async () => {
    const { service } = setup({
      transaksi: () => of(makeTransaksi()),
      tagihan: () => throwError(() => new HttpErrorResponse({ status: 403 })),
    });
    const outcome = await run(service, 1);

    expect(outcome.status).toBe('error');
    if (outcome.status === 'error') {
      expect(outcome.message).toContain('tidak memiliki akses');
    }
  });
});
