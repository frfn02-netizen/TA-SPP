import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, of, throwError } from 'rxjs';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { StudentDashboardPage } from './student-dashboard-page';

const bill = (
  id: number,
  nominal: string,
  status: 'BELUM_LUNAS' | 'LUNAS',
  bulan = 9,
): Tagihan => ({
  id,
  siswa_id: 1,
  tahun_ajaran_id: 1,
  bulan,
  tahun: 2025,
  nominal,
  jatuh_tempo: '2025-09-10',
  status,
  keterangan: null,
  created_at: '2025-09-01T00:00:00.000Z',
  updated_at: '2025-09-01T00:00:00.000Z',
  tahun_ajaran: '2025/2026',
  semester: 'GANJIL',
});

const detail: Tagihan = {
  ...bill(1, '150000.00', 'BELUM_LUNAS'),
  nama: 'Budi',
  nisn: '1234567890',
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

interface Overrides {
  getBills?: () => Observable<Tagihan[]>;
  getTransactions?: () => Observable<Transaksi[]>;
  getDetail?: () => Observable<Tagihan>;
}

function setup(overrides: Overrides = {}): ComponentFixture<StudentDashboardPage> {
  TestBed.configureTestingModule({
    imports: [StudentDashboardPage],
    providers: [
      provideRouter([]),
      {
        provide: TagihanService,
        useValue: {
          getList: overrides.getBills ?? (() => of([bill(1, '150000.00', 'BELUM_LUNAS'), bill(2, '200000.00', 'BELUM_LUNAS'), bill(3, '150000.00', 'LUNAS')])),
          getById: overrides.getDetail ?? (() => of(detail)),
        },
      },
      {
        provide: TransaksiService,
        useValue: {
          getList: overrides.getTransactions ?? (() => of([transaction])),
        },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return TestBed.createComponent(StudentDashboardPage);
}

function textOf(fixture: ComponentFixture<StudentDashboardPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('StudentDashboardPage', () => {
  it('derives summary values from real tagihan and transaksi data', () => {
    const fixture = setup();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Halo, Budi');
    expect(text).toContain('Kelas X RPL');
    expect(text).toContain('Tagihan Belum Lunas');
    expect(text).toContain('Rp 350.000');
    expect(text).toContain('SPP-20250910-ABCDEF');
  });

  it('uses a neutral greeting when no student name is available', () => {
    const fixture = setup({ getBills: () => of([]), getTransactions: () => of([]) });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Belum ada tagihan');
    expect(text).not.toContain('Halo,');
  });

  it('shows a loading state before data arrives', () => {
    const fixture = setup({ getBills: () => new Observable<Tagihan[]>() });
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Memuat data portal siswa');
  });

  it('shows an error state with retry when loading fails', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Error' });
    const fixture = setup({ getBills: () => throwError(() => error) });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Data tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
  });
});
