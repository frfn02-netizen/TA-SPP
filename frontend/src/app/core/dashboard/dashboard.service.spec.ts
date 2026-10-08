import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { DashboardStats } from './dashboard.model';
import { DashboardService } from './dashboard.service';

const sample: DashboardStats = {
  totalSiswa: 3,
  totalTagihan: 4,
  totalLunas: 1,
  totalBelumLunas: 3,
  totalTransaksi: 1,
  totalPendapatan: 250000,
};

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests GET /api/dashboard and unwraps the data field', () => {
    let received: DashboardStats | undefined;

    service.getStats().subscribe((value) => {
      received = value;
    });

    const request = httpMock.expectOne('/api/dashboard');
    expect(request.request.method).toBe('GET');

    request.flush({ success: true, message: 'Success', data: sample });

    expect(received).toEqual(sample);
  });
});
