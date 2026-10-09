import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import {
  Transaksi,
  TransaksiCreatePayload,
  TransaksiCreateResult,
} from './transaksi.model';

@Injectable({ providedIn: 'root' })
export class TransaksiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getList(): Observable<Transaksi[]> {
    return this.http
      .get<ApiResponse<Transaksi[]>>(`${this.apiBaseUrl}/transaksi`)
      .pipe(map((response) => response.data));
  }

  getById(id: number): Observable<Transaksi> {
    return this.http
      .get<ApiResponse<Transaksi>>(`${this.apiBaseUrl}/transaksi/${id}`)
      .pipe(map((response) => response.data));
  }

  create(payload: TransaksiCreatePayload): Observable<TransaksiCreateResult> {
    return this.http
      .post<ApiResponse<TransaksiCreateResult>>(
        `${this.apiBaseUrl}/transaksi`,
        payload,
      )
      .pipe(map((response) => response.data));
  }
}
