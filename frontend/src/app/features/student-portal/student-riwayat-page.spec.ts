import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, of, throwError } from 'rxjs';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { StudentRiwayatPage } from './student-riwayat-page';

const transaction: Transaksi = {
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
  bulan: 9,
  tahun: 2025,
  status: 'LUNAS',
};

function setup(getList: () => Observable<Transaksi[]>): ComponentFixture<StudentRiwayatPage> {
  TestBed.configureTestingModule({
    imports: [StudentRiwayatPage],
    providers: [
      provideRouter([]),
      {
        provide: TransaksiService,
        useValue: { getList, getById: () => of(transaction) },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return TestBed.createComponent(StudentRiwayatPage);
}

function textOf(fixture: ComponentFixture<StudentRiwayatPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('StudentRiwayatPage', () => {
  it('renders the student transactions', () => {
    const fixture = setup(() => of([transaction]));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('SPP-20250910-ABCDEF');
    expect(text).toContain('Rp 150.000');
    expect(text).toContain('Lunas');
  });

  it('shows an empty state without transactions', () => {
    const fixture = setup(() => of([]));
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Belum ada transaksi');
  });

  it('shows an error state with retry', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const fixture = setup(() => throwError(() => error));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Riwayat pembayaran tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
  });

  it('opens a transaction detail', () => {
    const fixture = setup(() => of([transaction]));
    fixture.detectChanges();

    fixture.componentInstance.openDetail(transaction);
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Detail Transaksi');
    expect(text).toContain('SPP-20250910-ABCDEF');
    expect(text).toContain('Status Tagihan');
  });
});
