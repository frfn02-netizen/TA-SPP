import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ReceiptOutcome } from '../../core/receipt/receipt.model';
import { ReceiptService } from '../../core/receipt/receipt.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { TransaksiPage } from './transaksi-page';

const settled: Transaksi = {
  id: 1,
  tagihan_id: 1,
  order_id: 'SPP-20250910-ABCDEF',
  gross_amount: '150000.00',
  transaction_status: 'SETTLEMENT',
  payment_type: 'qris',
  snap_token: null,
  payment_url: null,
  transaction_time: '2025-09-10T08:00:00.000Z',
  settlement_time: null,
  paid_at: null,
  midtrans_response: null,
  created_at: '2025-09-10T08:00:00.000Z',
  updated_at: '2025-09-10T08:00:00.000Z',
  nama: 'Budi Santoso',
  bulan: 9,
  tahun: 2025,
};

const pending: Transaksi = {
  ...settled,
  id: 2,
  order_id: 'SPP-20250910-PENDING',
  transaction_status: 'PENDING',
  nama: 'Andi',
};

interface Setup {
  fixture: ComponentFixture<TransaksiPage>;
  generateIds: number[];
  download: ReturnType<typeof vi.fn>;
}

function setup(
  getList: () => Observable<Transaksi[]>,
  outcome: ReceiptOutcome = {
    status: 'ok',
    blob: new Blob(['%PDF-1.4']),
    fileName: 'struk-SPP-20250910-ABCDEF.pdf',
  },
): Setup {
  const generateIds: number[] = [];
  const download = vi.fn();

  TestBed.configureTestingModule({
    imports: [TransaksiPage],
    providers: [
      {
        provide: TransaksiService,
        useValue: { getList, getById: () => of(settled) },
      },
      {
        provide: ReceiptService,
        useValue: {
          generate: (id: number) => {
            generateIds.push(id);
            return of(outcome);
          },
          download,
        },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return { fixture: TestBed.createComponent(TransaksiPage), generateIds, download };
}

function textOf(fixture: ComponentFixture<TransaksiPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('TransaksiPage', () => {
  it('renders transactions guarded by role data', () => {
    const { fixture } = setup(() => of([settled]));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('SPP-20250910-ABCDEF');
    expect(text).toContain('Budi Santoso');
  });

  it('exposes the receipt action only for SETTLEMENT transactions', () => {
    const { fixture } = setup(() => of([settled, pending]));
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(
      host.querySelector('[aria-label="Unduh struk PDF untuk SPP-20250910-ABCDEF"]'),
    ).not.toBeNull();
    expect(
      host.querySelector('[aria-label="Unduh struk PDF untuk SPP-20250910-PENDING"]'),
    ).toBeNull();
  });

  it('uses the shared receipt service to generate and download the PDF', () => {
    const { fixture, generateIds, download } = setup(() => of([settled]));
    fixture.detectChanges();

    fixture.componentInstance.downloadReceipt(settled);
    fixture.detectChanges();

    expect(generateIds).toEqual([1]);
    expect(download).toHaveBeenCalledTimes(1);
    expect(textOf(fixture)).toContain('Struk PDF berhasil dibuat');
  });

  it('shows a message when the receipt is ineligible', () => {
    const { fixture } = setup(() => of([settled]), {
      status: 'ineligible',
      reason: 'Status transaksi sudah lunas, tetapi status tagihan belum LUNAS.',
    });
    fixture.detectChanges();

    fixture.componentInstance.downloadReceipt(settled);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('belum LUNAS');
  });

  it('shows an error message when the receipt fetch fails', () => {
    const { fixture } = setup(() => of([settled]), {
      status: 'error',
      message: 'Anda tidak memiliki akses ke transaksi ini.',
    });
    fixture.detectChanges();

    fixture.componentInstance.downloadReceipt(settled);
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('tidak memiliki akses');
  });

  it('keeps the existing list error state', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const { fixture } = setup(() => throwError(() => error));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Data transaksi tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
  });
});
