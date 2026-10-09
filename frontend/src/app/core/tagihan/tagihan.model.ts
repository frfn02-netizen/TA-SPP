import { BillStatus } from '../../shared/util/status';

export interface Tagihan {
  id: number;
  siswa_id: number;
  tahun_ajaran_id: number;
  bulan: number;
  tahun: number;
  nominal: string;
  jatuh_tempo: string;
  status: BillStatus;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  nisn?: string;
  nama?: string;
  kelas_id?: number;
  tingkat?: string;
  jurusan?: string;
  tahun_ajaran?: string;
  semester?: string;
}

export interface TagihanPayload {
  siswaId: number;
  tahunAjaranId: number;
  bulan: number;
  tahun: number;
  nominal: number;
  jatuhTempo: string;
  keterangan?: string;
}

export type BulkTargetScope = 'ALL' | 'KELAS';

export interface BulkPeriode {
  bulan: number;
  tahun: number;
}

export interface BulkTahunAjaranSummary {
  id: number;
  nama: string;
  semester: string;
}

export interface BulkTargetSummary {
  scope: BulkTargetScope;
  kelasId: number | null;
}

export interface BulkPreviewRequest {
  tahunAjaranId: number;
  bulan: number;
  tahun: number;
  nominal: number;
  kelasId: number | null;
}

export interface BulkGenerateRequest extends BulkPreviewRequest {
  jatuhTempo: string;
  keterangan?: string;
}

export interface BulkPreviewResult {
  periode: BulkPeriode;
  tahunAjaran: BulkTahunAjaranSummary;
  target: BulkTargetSummary;
  nominal: number;
  totalTarget: number;
  willCreate: number;
  skipped: number;
  totalNominal: number;
}

export interface BulkGenerateResult {
  periode: BulkPeriode;
  tahunAjaran: BulkTahunAjaranSummary;
  target: BulkTargetSummary;
  nominal: number;
  totalTarget: number;
  created: number;
  skipped: number;
  failed: number;
  totalNominal: number;
}
