import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { TahunAjaran, TahunAjaranPayload } from './tahun-ajaran.model';
import { TahunAjaranService } from './tahun-ajaran.service';

const item: TahunAjaran = {
  id: 1,
  nama: '2025/2026',
  semester: 'GANJIL',
  aktif: true,
};
const payload: TahunAjaranPayload = { nama: '2025/2026', semester: 'GANJIL' };

describe('TahunAjaranService', () => {
  let service: TahunAjaranService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TahunAjaranService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /api/tahun-ajaran unwraps the data field', () => {
    let received: TahunAjaran[] | undefined;
    service.getList().subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/tahun-ajaran');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: [item] });

    expect(received).toEqual([item]);
  });

  it('POST /api/tahun-ajaran sends the payload', () => {
    service.create(payload).subscribe();
    const request = httpMock.expectOne('/api/tahun-ajaran');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, message: 'ok', data: item });
  });

  it('PATCH /api/tahun-ajaran/:id/activate activates a year', () => {
    service.activate(1).subscribe();
    const request = httpMock.expectOne('/api/tahun-ajaran/1/activate');
    expect(request.request.method).toBe('PATCH');
    request.flush({ success: true, message: 'ok', data: null });
  });
});
