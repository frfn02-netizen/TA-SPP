import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Tagihan, TagihanPayload } from './tagihan.model';
import { TagihanService } from './tagihan.service';

const item: Tagihan = {
  id: 1,
  siswa_id: 1,
  tahun_ajaran_id: 1,
  bulan: 9,
  tahun: 2025,
  nominal: '150000.00',
  jatuh_tempo: '2025-09-10',
  status: 'BELUM_LUNAS',
  keterangan: null,
  created_at: '2025-09-01',
  updated_at: '2025-09-01',
  nisn: '1234567890',
  nama: 'Budi',
  tingkat: 'X',
  jurusan: 'RPL',
};
const payload: TagihanPayload = {
  siswaId: 1,
  tahunAjaranId: 1,
  bulan: 9,
  tahun: 2025,
  nominal: 150000,
  jatuhTempo: '2025-09-10',
};

describe('TagihanService', () => {
  let service: TagihanService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TagihanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /api/tagihan unwraps the data field', () => {
    let received: Tagihan[] | undefined;
    service.getList().subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/tagihan');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: [item] });

    expect(received).toEqual([item]);
  });

  it('GET /api/tagihan/:id returns a single bill', () => {
    let received: Tagihan | undefined;
    service.getById(1).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/tagihan/1');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: item });

    expect(received).toEqual(item);
  });

  it('POST /api/tagihan sends the payload', () => {
    service.create(payload).subscribe();
    const request = httpMock.expectOne('/api/tagihan');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, message: 'Tagihan berhasil dibuat', data: item });
  });

  it('PUT /api/tagihan/:id updates a bill', () => {
    service.update(1, payload).subscribe();
    const request = httpMock.expectOne('/api/tagihan/1');
    expect(request.request.method).toBe('PUT');
    request.flush({ success: true, message: 'ok', data: item });
  });

  it('DELETE /api/tagihan/:id removes a bill', () => {
    service.remove(1).subscribe();
    const request = httpMock.expectOne('/api/tagihan/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, message: 'ok', data: null });
  });
});
