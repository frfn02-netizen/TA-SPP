import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, of, throwError } from 'rxjs';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { StudentTagihanPage } from './student-tagihan-page';

const bill = (
  id: number,
  bulan: number,
  nominal: string,
  status: 'BELUM_LUNAS' | 'LUNAS',
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

function setup(
  getList: () => Observable<Tagihan[]>,
): ComponentFixture<StudentTagihanPage> {
  TestBed.configureTestingModule({
    imports: [StudentTagihanPage],
    providers: [
      provideRouter([]),
      { provide: TagihanService, useValue: { getList } },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  return TestBed.createComponent(StudentTagihanPage);
}

function textOf(fixture: ComponentFixture<StudentTagihanPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('StudentTagihanPage', () => {
  it('renders bills with period, amount, and status', () => {
    const fixture = setup(() =>
      of([bill(1, 9, '150000.00', 'BELUM_LUNAS'), bill(2, 10, '150000.00', 'LUNAS')]),
    );
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('September 2025');
    expect(text).toContain('Oktober 2025');
    expect(text).toContain('Rp 150.000');
    expect(text).toContain('Bayar');
    expect(text).toContain('Sudah dibayar');
  });

  it('filters bills by status', () => {
    const fixture = setup(() =>
      of([bill(1, 9, '150000.00', 'BELUM_LUNAS'), bill(2, 10, '150000.00', 'LUNAS')]),
    );
    fixture.detectChanges();

    fixture.componentInstance.setFilter('LUNAS');
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Menampilkan 1 dari 2 tagihan');
    expect(text).toContain('Sudah dibayar');
    expect(text).not.toContain('Bayar');
  });

  it('shows a distinct empty state when a filter matches nothing', () => {
    const fixture = setup(() => of([bill(2, 10, '150000.00', 'LUNAS')]));
    fixture.detectChanges();

    fixture.componentInstance.setFilter('BELUM_LUNAS');
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Tidak ada tagihan pada filter ini');
  });

  it('shows an empty state when there are no bills at all', () => {
    const fixture = setup(() => of([]));
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Belum ada tagihan');
  });

  it('shows an error state with retry', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const fixture = setup(() => throwError(() => error));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Data tagihan tidak dapat dimuat');
    expect(text).toContain('Muat ulang');
  });
});
