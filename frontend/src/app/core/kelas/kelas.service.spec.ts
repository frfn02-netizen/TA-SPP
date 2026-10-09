import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Kelas, KelasPayload } from './kelas.model';
import { KelasService } from './kelas.service';

const item: Kelas = {
  id: 1,
  tingkat: 'X',
  jurusan: 'RPL',
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};
const payload: KelasPayload = { tingkat: 'X', jurusan: 'RPL' };

describe('KelasService', () => {
  let service: KelasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(KelasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /api/kelas unwraps the data field', () => {
    let received: Kelas[] | undefined;
    service.getList().subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/kelas');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: [item] });

    expect(received).toEqual([item]);
  });

  it('POST /api/kelas sends the payload', () => {
    service.create(payload).subscribe();
    const request = httpMock.expectOne('/api/kelas');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, message: 'ok', data: item });
  });

  it('PUT /api/kelas/:id updates a class', () => {
    service.update(1, payload).subscribe();
    const request = httpMock.expectOne('/api/kelas/1');
    expect(request.request.method).toBe('PUT');
    request.flush({ success: true, message: 'ok', data: item });
  });

  it('DELETE /api/kelas/:id removes a class', () => {
    service.remove(1).subscribe();
    const request = httpMock.expectOne('/api/kelas/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, message: 'ok', data: null });
  });
});
