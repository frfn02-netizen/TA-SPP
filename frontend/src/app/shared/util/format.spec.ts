import { formatNumber, formatRupiah } from './format';

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
});
