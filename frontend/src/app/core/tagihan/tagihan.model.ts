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
