export type JenisKelamin = 'L' | 'P';

export interface SiswaListItem {
  id: number;
  nisn: string;
  nama: string;
  jenis_kelamin: JenisKelamin;
  alamat: string;
  no_hp: string;
  username: string;
  kelas_id: number;
  tingkat: string;
  jurusan: string;
}

export interface SiswaDetail extends SiswaListItem {
  user_id: number;
}

export interface SiswaPayload {
  kelasId: number;
  nisn: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  alamat: string;
  noHp: string;
}
