export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function monthLabel(bulan: number | null | undefined): string {
  if (!bulan) {
    return '-';
  }
  return MONTH_NAMES[bulan - 1] ?? '-';
}

export function periodLabel(
  bulan: number | null | undefined,
  tahun: number | null | undefined,
): string {
  if (!bulan || !tahun) {
    return '-';
  }
  return `${monthLabel(bulan)} ${tahun}`;
}
