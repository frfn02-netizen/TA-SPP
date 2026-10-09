import { isTrustedMidtransUrl } from './midtrans-url.util';

describe('isTrustedMidtransUrl', () => {
  it('accepts Midtrans Snap https hosts', () => {
    expect(
      isTrustedMidtransUrl('https://app.sandbox.midtrans.com/snap/v3/redirection/abc'),
    ).toBe(true);
    expect(
      isTrustedMidtransUrl('https://app.midtrans.com/snap/v3/redirection/abc'),
    ).toBe(true);
  });

  it('rejects non-https and non-midtrans hosts', () => {
    expect(
      isTrustedMidtransUrl('http://app.sandbox.midtrans.com/snap/abc'),
    ).toBe(false);
    expect(isTrustedMidtransUrl('https://evil.example.com/pay')).toBe(false);
    expect(isTrustedMidtransUrl('https://midtrans.com.evil.com/pay')).toBe(false);
  });

  it('rejects empty or malformed values', () => {
    expect(isTrustedMidtransUrl(null)).toBe(false);
    expect(isTrustedMidtransUrl(undefined)).toBe(false);
    expect(isTrustedMidtransUrl('')).toBe(false);
    expect(isTrustedMidtransUrl('not a url')).toBe(false);
  });
});
