import { HttpErrorResponse } from '@angular/common/http';

function readServerMessage(error: HttpErrorResponse): string | null {
  const body = error.error;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return null;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Server tidak merespons. Muat ulang halaman untuk mencoba lagi.';
  }

  const serverMessage = readServerMessage(error);
  if (serverMessage && error.status < 500) {
    return serverMessage;
  }

  if (error.status === 403) {
    return 'Akun Anda tidak memiliki akses ke data ini.';
  }

  return fallback;
}
