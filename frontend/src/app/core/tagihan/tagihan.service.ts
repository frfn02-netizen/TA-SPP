import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { Tagihan, TagihanPayload } from './tagihan.model';

@Injectable({ providedIn: 'root' })
export class TagihanService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getList(): Observable<Tagihan[]> {
    return this.http
      .get<ApiResponse<Tagihan[]>>(`${this.apiBaseUrl}/tagihan`)
      .pipe(map((response) => response.data));
  }

  getById(id: number): Observable<Tagihan> {
    return this.http
      .get<ApiResponse<Tagihan>>(`${this.apiBaseUrl}/tagihan/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: TagihanPayload): Observable<Tagihan> {
    return this.http
      .post<ApiResponse<Tagihan>>(`${this.apiBaseUrl}/tagihan`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: TagihanPayload): Observable<Tagihan> {
    return this.http
      .put<ApiResponse<Tagihan>>(`${this.apiBaseUrl}/tagihan/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: number): Observable<null> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiBaseUrl}/tagihan/${id}`)
      .pipe(map((response) => response.data));
  }
}
