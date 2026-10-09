import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, Subject, of, throwError } from 'rxjs';
import { DashboardStats } from '../../core/dashboard/dashboard.model';
import { DashboardService } from '../../core/dashboard/dashboard.service';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { DashboardPage } from './dashboard-page';

const sample: DashboardStats = {
  totalSiswa: 3,
  totalTagihan: 4,
  totalLunas: 1,
  totalBelumLunas: 3,
  totalTransaksi: 1,
  totalPendapatan: 250000,
};

const bill: Tagihan = {
  id: 1,
  siswa_id: 1,
  tahun_ajaran_id: 1,
  bulan: 9,
  tahun: 2025,
  nominal: '150000.00',
  jatuh_tempo: '2025-09-10',
  status: 'BELUM_LUNAS',
  keterangan: null,
  created_at: '2025-09-01T00:00:00.000Z',
  updated_at: '2025-09-01T00:00:00.000Z',
  nisn: '1234567890',
  nama: 'Budi',
  tingkat: 'X',
  jurusan: 'RPL',
};

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
};

interface SetupOptions {
  getStats?: () => Observable<DashboardStats>;
  getBills?: () => Observable<Tagihan[]>;
  getTransactions?: () => Observable<Transaksi[]>;
}

function setup(options: SetupOptions = {}): ComponentFixture<DashboardPage> {
  TestBed.configureTestingModule({
    imports: [DashboardPage],
    providers: [
      provideRouter([]),
      {
        provide: DashboardService,
        useValue: { getStats: options.getStats ?? (() => of(sample)) },
      },
      {
        provide: TagihanService,
        useValue: { getList: options.getBills ?? (() => of([])) },
      },
      {
        provide: TransaksiService,
        useValue: { getList: options.getTransactions ?? (() => of([])) },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return TestBed.createComponent(DashboardPage);
}

function textOf(fixture: ComponentFixture<DashboardPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('DashboardPage', () => {
  it('renders real KPI values and the payment status summary', () => {
    const fixture = setup();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Total Siswa');
    expect(text).toContain('Belum Lunas');
    expect(text).toContain('Rp 250.000');
    expect(text).toContain('25% dari total');
    expect(text).toContain('75% dari total');
  });

  it('renders the tagihan status bar chart with an accessible label', () => {
    const fixture = setup();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Status Tagihan');
    expect(text).toContain('Lunas');

    const chart = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="img"]',
    );
    expect(chart).not.toBeNull();
    expect(chart?.getAttribute('aria-label')).toContain(
      'Diagram batang status tagihan',
    );
  });

  it('renders recent bills and transactions from real data', () => {
    const fixture = setup({
      getBills: () => of([bill]),
      getTransactions: () => of([transaction]),
    });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Tagihan Terbaru');
    expect(text).toContain('Transaksi Terbaru');
    expect(text).toContain('Budi');
    expect(text).toContain('SPP-20250910-ABCDEF');
  });

  it('shows a loading skeleton before the data arrives', () => {
    const subject = new Subject<DashboardStats>();
    const fixture = setup({ getStats: () => subject.asObservable() });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Memuat data dashboard');

    subject.next(sample);
    subject.complete();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Rp 250.000');
  });

  it('shows an Indonesian error state with a retry action when the request fails', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const fixture = setup({ getStats: () => throwError(() => error) });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Data dashboard tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
    expect(text).not.toContain('Total Siswa');
  });

  it('shows an empty note when there are no bills yet', () => {
    const empty: DashboardStats = {
      totalSiswa: 0,
      totalTagihan: 0,
      totalLunas: 0,
      totalBelumLunas: 0,
      totalTransaksi: 0,
      totalPendapatan: 0,
    };
    const fixture = setup({ getStats: () => of(empty) });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Belum ada tagihan yang tercatat');
  });

  it('shows honest empty notes when there are no recent records', () => {
    const fixture = setup();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Belum ada tagihan yang tercatat');
    expect(text).toContain('Belum ada transaksi yang tercatat');
  });
});
