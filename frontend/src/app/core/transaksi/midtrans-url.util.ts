const TRUSTED_MIDTRANS_HOSTS = new Set([
  'app.midtrans.com',
  'app.sandbox.midtrans.com',
]);

export function isTrustedMidtransUrl(
  value: string | null | undefined,
): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.toLowerCase();
    return TRUSTED_MIDTRANS_HOSTS.has(host) || host.endsWith('.midtrans.com');
  } catch {
    return false;
  }
}
