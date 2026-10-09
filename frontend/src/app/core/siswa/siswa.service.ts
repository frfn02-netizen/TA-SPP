import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { SiswaDetail, SiswaListItem, SiswaPayload } from './siswa.model';

@Injectable({ providedIn: 'root' })
export class SiswaService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getList(): Observable<SiswaListItem[]> {
    return this.http
      .get<ApiResponse<SiswaListItem[]>>(`${this.apiBaseUrl}/siswa`)
      .pipe(map((response) => response.data));
  }

  getById(id: number): Observable<SiswaDetail> {
    return this.http
      .get<ApiResponse<SiswaDetail>>(`${this.apiBaseUrl}/siswa/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: SiswaPayload): Observable<SiswaDetail> {
    return this.http
      .post<ApiResponse<SiswaDetail>>(`${this.apiBaseUrl}/siswa`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: SiswaPayload): Observable<SiswaDetail> {
    return this.http
      .put<ApiResponse<SiswaDetail>>(`${this.apiBaseUrl}/siswa/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: number): Observable<null> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiBaseUrl}/siswa/${id}`)
      .pipe(map((response) => response.data));
  }
}
