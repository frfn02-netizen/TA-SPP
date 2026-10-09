export type Tingkat = 'X' | 'XI' | 'XII';

export interface Kelas {
  id: number;
  tingkat: Tingkat;
  jurusan: string;
  created_at: string;
  updated_at: string;
}

export interface KelasPayload {
  tingkat: Tingkat;
  jurusan: string;
}
