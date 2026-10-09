const numberFormatter = new Intl.NumberFormat('id-ID');
const currencyFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatRupiah(value: number): string {
  return `Rp ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

export function formatRupiahFrom(
  value: number | string | null | undefined,
): string {
  const numeric =
    typeof value === 'string' ? Number(value) : (value ?? undefined);
  return formatRupiah(typeof numeric === 'number' ? numeric : 0);
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '-';
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '-';
}
