import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Transaksi, TransaksiCreateResult } from './transaksi.model';
import { TransaksiService } from './transaksi.service';

const item: Transaksi = {
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
  nama: 'Budi',
  bulan: 9,
  tahun: 2025,
};

describe('TransaksiService', () => {
  let service: TransaksiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TransaksiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /api/transaksi unwraps the data field', () => {
    let received: Transaksi[] | undefined;
    service.getList().subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/transaksi');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: [item] });

    expect(received).toEqual([item]);
  });

  it('GET /api/transaksi/:id returns a single transaction', () => {
    let received: Transaksi | undefined;
    service.getById(1).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/transaksi/1');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: item });

    expect(received).toEqual(item);
  });

  it('POST /api/transaksi sends { tagihanId } and unwraps the payment result', () => {
    const result: TransaksiCreateResult = {
      id: 7,
      orderId: 'SPP-20250910-ABCDEF',
      transactionStatus: 'PENDING',
      snapToken: 'snap-token',
      paymentUrl: 'https://app.sandbox.midtrans.com/snap/v3/redirection/abc',
    };

    let received: TransaksiCreateResult | undefined;
    service.create({ tagihanId: 5 }).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/transaksi');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ tagihanId: 5 });
    request.flush({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: result,
    });

    expect(received).toEqual(result);
  });
});
