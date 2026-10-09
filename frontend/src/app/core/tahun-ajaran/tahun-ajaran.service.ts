import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { TahunAjaran, TahunAjaranPayload } from './tahun-ajaran.model';

@Injectable({ providedIn: 'root' })
export class TahunAjaranService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getList(): Observable<TahunAjaran[]> {
    return this.http
      .get<ApiResponse<TahunAjaran[]>>(`${this.apiBaseUrl}/tahun-ajaran`)
      .pipe(map((response) => response.data));
  }

  create(payload: TahunAjaranPayload): Observable<TahunAjaran> {
    return this.http
      .post<ApiResponse<TahunAjaran>>(`${this.apiBaseUrl}/tahun-ajaran`, payload)
      .pipe(map((response) => response.data));
  }

  activate(id: number): Observable<null> {
    return this.http
      .patch<ApiResponse<null>>(
        `${this.apiBaseUrl}/tahun-ajaran/${id}/activate`,
        {},
      )
      .pipe(map((response) => response.data));
  }
}
