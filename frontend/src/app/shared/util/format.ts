const numberFormatter = new Intl.NumberFormat('id-ID');
const currencyFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatRupiah(value: number): string {
  return `Rp ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}
