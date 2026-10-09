export type Semester = 'GANJIL' | 'GENAP';

export interface TahunAjaran {
  id: number;
  nama: string;
  semester: Semester;
  aktif: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface TahunAjaranPayload {
  nama: string;
  semester: Semester;
  aktif?: boolean;
}
