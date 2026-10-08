import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, Subject, of, throwError } from 'rxjs';
import { DashboardStats } from '../../core/dashboard/dashboard.model';
import { DashboardService } from '../../core/dashboard/dashboard.service';
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

function setup(
  getStats: () => Observable<DashboardStats>,
): ComponentFixture<DashboardPage> {
  TestBed.configureTestingModule({
    imports: [DashboardPage],
    providers: [
      { provide: DashboardService, useValue: { getStats } },
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
    const fixture = setup(() => of(sample));
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Total Siswa');
    expect(text).toContain('Belum Lunas');
    expect(text).toContain('Rp 250.000');
    expect(text).toContain('25% dari total');
    expect(text).toContain('75% dari total');
  });

  it('shows a loading skeleton before the data arrives', () => {
    const subject = new Subject<DashboardStats>();
    const fixture = setup(() => subject.asObservable());
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Memuat data dashboard');

    subject.next(sample);
    subject.complete();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Rp 250.000');
  });

  it('shows an Indonesian error state with a retry action when the request fails', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const fixture = setup(() => throwError(() => error));
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
    const fixture = setup(() => of(empty));
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Belum ada tagihan yang tercatat');
  });
});
