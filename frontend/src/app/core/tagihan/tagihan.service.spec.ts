import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import {
  BulkGenerateResult,
  BulkPreviewResult,
  Tagihan,
  TagihanPayload,
} from './tagihan.model';
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

  it('GET /api/tagihan/bulk-preview sends query params and unwraps data', () => {
    const preview: BulkPreviewResult = {
      periode: { bulan: 9, tahun: 2025 },
      tahunAjaran: { id: 1, nama: '2025/2026', semester: 'GANJIL' },
      target: { scope: 'KELAS', kelasId: 2 },
      nominal: 150000,
      totalTarget: 10,
      willCreate: 8,
      skipped: 2,
      totalNominal: 1200000,
    };

    let received: BulkPreviewResult | undefined;
    service
      .bulkPreview({
        tahunAjaranId: 1,
        bulan: 9,
        tahun: 2025,
        nominal: 150000,
        kelasId: 2,
      })
      .subscribe((value) => (received = value));

    const request = httpMock.expectOne(
      (req) => req.url === '/api/tagihan/bulk-preview',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('tahunAjaranId')).toBe('1');
    expect(request.request.params.get('bulan')).toBe('9');
    expect(request.request.params.get('tahun')).toBe('2025');
    expect(request.request.params.get('nominal')).toBe('150000');
    expect(request.request.params.get('kelasId')).toBe('2');

    request.flush({ success: true, message: 'Success', data: preview });
    expect(received).toEqual(preview);
  });

  it('GET /api/tagihan/bulk-preview omits kelasId for all-student target', () => {
    service
      .bulkPreview({
        tahunAjaranId: 1,
        bulan: 9,
        tahun: 2025,
        nominal: 150000,
        kelasId: null,
      })
      .subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === '/api/tagihan/bulk-preview',
    );
    expect(request.request.params.has('kelasId')).toBe(false);
    request.flush({
      success: true,
      message: 'Success',
      data: {
        periode: { bulan: 9, tahun: 2025 },
        tahunAjaran: { id: 1, nama: '2025/2026', semester: 'GANJIL' },
        target: { scope: 'ALL', kelasId: null },
        nominal: 150000,
        totalTarget: 4,
        willCreate: 4,
        skipped: 0,
        totalNominal: 600000,
      },
    });
  });

  it('POST /api/tagihan/bulk-generate sends the payload and unwraps the result', () => {
    const result: BulkGenerateResult = {
      periode: { bulan: 9, tahun: 2025 },
      tahunAjaran: { id: 1, nama: '2025/2026', semester: 'GANJIL' },
      target: { scope: 'KELAS', kelasId: 2 },
      nominal: 150000,
      totalTarget: 10,
      created: 8,
      skipped: 2,
      failed: 0,
      totalNominal: 1200000,
    };

    const payload = {
      tahunAjaranId: 1,
      bulan: 9,
      tahun: 2025,
      nominal: 150000,
      kelasId: 2,
      jatuhTempo: '2025-09-10',
    };

    let received: BulkGenerateResult | undefined;
    service.bulkGenerate(payload).subscribe((value) => (received = value));

    const request = httpMock.expectOne('/api/tagihan/bulk-generate');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      success: true,
      message: 'Tagihan massal berhasil diproses',
      data: result,
    });

    expect(received).toEqual(result);
  });
});
