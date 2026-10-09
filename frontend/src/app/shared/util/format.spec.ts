import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRupiah,
  formatRupiahFrom,
} from './format';

describe('format', () => {
  it('formats numbers with Indonesian thousand separators', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1234)).toBe('1.234');
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('formats rupiah in full precision with the Rp prefix', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(350000)).toBe('Rp 350.000');
    expect(formatRupiah(250000)).toBe('Rp 250.000');
  });

  it('never shows abbreviations or K/M suffixes', () => {
    const value = formatRupiah(52400000);
    expect(value).toBe('Rp 52.400.000');
    expect(value).not.toContain('K');
  });

  it('formats numeric strings returned by the API as rupiah', () => {
    expect(formatRupiahFrom('150000.00')).toBe('Rp 150.000');
    expect(formatRupiahFrom(250000)).toBe('Rp 250.000');
    expect(formatRupiahFrom(null)).toBe('Rp 0');
    expect(formatRupiahFrom(undefined)).toBe('Rp 0');
  });

  it('formats dates and datetimes in Indonesian format', () => {
    expect(formatDate('2025-09-10')).toBe('10 Sep 2025');
    expect(formatDate(null)).toBe('-');
    expect(formatDate('bukan-tanggal')).toBe('-');
    expect(formatDateTime('2025-09-10T08:00:00.000Z')).toContain('10 Sep 2025');
  });
});
