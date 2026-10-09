import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { SiswaDetail, SiswaListItem, SiswaPayload } from './siswa.model';
import { SiswaService } from './siswa.service';

const list: SiswaListItem[] = [
  {
    id: 1,
    nisn: '1234567890',
    nama: 'Budi',
    jenis_kelamin: 'L',
    alamat: 'Jl. Mawar No 1',
    no_hp: '081234567890',
    username: '1234567890',
    kelas_id: 1,
    tingkat: 'X',
    jurusan: 'RPL',
  },
];
const detail: SiswaDetail = { ...list[0], user_id: 9 };
const payload: SiswaPayload = {
  kelasId: 1,
  nisn: '1234567890',
  nama: 'Budi',
  jenisKelamin: 'L',
  alamat: 'Jl. Mawar No 1',
  noHp: '081234567890',
};

describe('SiswaService', () => {
  let service: SiswaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(SiswaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /api/siswa unwraps the data field', () => {
    let received: SiswaListItem[] | undefined;
    service.getList().subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/siswa');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: list });

    expect(received).toEqual(list);
  });

  it('GET /api/siswa/:id returns a single student', () => {
    let received: SiswaDetail | undefined;
    service.getById(1).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/siswa/1');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Success', data: detail });

    expect(received).toEqual(detail);
  });

  it('POST /api/siswa sends the payload and returns the created detail', () => {
    let received: SiswaDetail | undefined;
    service.create(payload).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/siswa');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, message: 'Siswa berhasil ditambahkan', data: detail });

    expect(received).toEqual(detail);
  });

  it('PUT /api/siswa/:id updates a student', () => {
    service.update(1, payload).subscribe();
    const request = httpMock.expectOne('/api/siswa/1');
    expect(request.request.method).toBe('PUT');
    request.flush({ success: true, message: 'ok', data: detail });
  });

  it('DELETE /api/siswa/:id removes a student', () => {
    service.remove(1).subscribe();
    const request = httpMock.expectOne('/api/siswa/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, message: 'ok', data: null });
  });
});
