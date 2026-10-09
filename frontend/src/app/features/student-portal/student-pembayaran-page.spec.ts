import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import {
  TransaksiCreatePayload,
  TransaksiCreateResult,
} from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { StudentPembayaranPage } from './student-pembayaran-page';

const payableBill: Tagihan = {
  id: 5,
  siswa_id: 1,
  tahun_ajaran_id: 1,
  bulan: 9,
  tahun: 2025,
  nominal: '150000.00',
  jatuh_tempo: '2025-09-10',
  status: 'BELUM_LUNAS',
  keterangan: 'SPP September',
  created_at: '2025-09-01T00:00:00.000Z',
  updated_at: '2025-09-01T00:00:00.000Z',
  tahun_ajaran: '2025/2026',
  semester: 'GANJIL',
};

const paidBill: Tagihan = { ...payableBill, status: 'LUNAS' };

const createResult: TransaksiCreateResult = {
  id: 7,
  orderId: 'SPP-20250910-ABCDEF',
  transactionStatus: 'PENDING',
  snapToken: 'snap-token',
  paymentUrl: 'https://app.sandbox.midtrans.com/snap/v3/redirection/abc',
};

interface Setup {
  fixture: ComponentFixture<StudentPembayaranPage>;
  createCalls: TransaksiCreatePayload[];
  redirect: ReturnType<typeof vi.spyOn>;
}

function setup(options: {
  bill?: Tagihan;
  create?: () => ReturnType<TransaksiService['create']>;
  onCheck?: () => Tagihan;
}): Setup {
  const createCalls: TransaksiCreatePayload[] = [];
  let getByIdCalls = 0;

  TestBed.configureTestingModule({
    imports: [StudentPembayaranPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({ tagihanId: '5' }) },
        },
      },
      {
        provide: TagihanService,
        useValue: {
          getById: () => {
            getByIdCalls += 1;
            if (getByIdCalls === 1 || !options.onCheck) {
              return of(options.bill ?? payableBill);
            }
            return of(options.onCheck());
          },
        },
      },
      {
        provide: TransaksiService,
        useValue: {
          create: (payload: TransaksiCreatePayload) => {
            createCalls.push(payload);
            return options.create ? options.create() : of(createResult);
          },
        },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  const fixture = TestBed.createComponent(StudentPembayaranPage);
  const redirect = vi
    .spyOn(fixture.componentInstance, 'redirect')
    .mockImplementation(() => undefined);

  return { fixture, createCalls, redirect };
}

function textOf(fixture: ComponentFixture<StudentPembayaranPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('StudentPembayaranPage', () => {
  it('shows the bill detail and a continue button for an unpaid bill', () => {
    const { fixture } = setup({});
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('September 2025');
    expect(text).toContain('Rp 150.000');
    expect(text).toContain('Lanjutkan Pembayaran');
  });

  it('creates a transaction with { tagihanId } and redirects to a trusted payment URL', () => {
    const { fixture, createCalls, redirect } = setup({});
    fixture.detectChanges();

    fixture.componentInstance.continuePayment();
    fixture.detectChanges();

    expect(createCalls).toEqual([{ tagihanId: 5 }]);
    expect(redirect).toHaveBeenCalledWith(createResult.paymentUrl);
  });

  it('prevents double submission while a request is in flight', () => {
    const subject = new Subject<TransaksiCreateResult>();
    const { fixture, createCalls } = setup({ create: () => subject.asObservable() });
    fixture.detectChanges();

    fixture.componentInstance.continuePayment();
    fixture.componentInstance.continuePayment();
    fixture.detectChanges();

    expect(createCalls.length).toBe(1);
  });

  it('refuses to redirect to an untrusted payment URL', () => {
    const { fixture, redirect } = setup({
      create: () => of({ ...createResult, paymentUrl: 'https://evil.example.com/pay' }),
    });
    fixture.detectChanges();

    fixture.componentInstance.continuePayment();
    fixture.detectChanges();

    expect(redirect).not.toHaveBeenCalled();
    expect(textOf(fixture)).toContain('URL pembayaran dari server tidak valid');
  });

  it('shows an error when the transaction cannot be created', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'Tagihan sudah lunas' },
    });
    const { fixture } = setup({ create: () => throwError(() => error) });
    fixture.detectChanges();

    fixture.componentInstance.continuePayment();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Tagihan sudah lunas');
  });

  it('does not offer payment for a bill that is already paid', () => {
    const { fixture } = setup({ bill: paidBill });
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Tagihan sudah lunas');
    expect(text).not.toContain('Lanjutkan Pembayaran');
  });

  it('reflects the backend status when checking status', () => {
    const { fixture } = setup({ bill: payableBill, onCheck: () => paidBill });
    fixture.detectChanges();

    fixture.componentInstance.checkStatus();
    fixture.detectChanges();

    expect(textOf(fixture)).toContain('Pembayaran Anda sudah dikonfirmasi');
    expect(textOf(fixture)).toContain('Tagihan sudah lunas');
  });
});
