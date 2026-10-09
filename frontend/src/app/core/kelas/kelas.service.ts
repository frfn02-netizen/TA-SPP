import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { Kelas, KelasPayload } from './kelas.model';

@Injectable({ providedIn: 'root' })
export class KelasService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getList(): Observable<Kelas[]> {
    return this.http
      .get<ApiResponse<Kelas[]>>(`${this.apiBaseUrl}/kelas`)
      .pipe(map((response) => response.data));
  }

  create(payload: KelasPayload): Observable<Kelas> {
    return this.http
      .post<ApiResponse<Kelas>>(`${this.apiBaseUrl}/kelas`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: KelasPayload): Observable<Kelas> {
    return this.http
      .put<ApiResponse<Kelas>>(`${this.apiBaseUrl}/kelas/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: number): Observable<null> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiBaseUrl}/kelas/${id}`)
      .pipe(map((response) => response.data));
  }
}
