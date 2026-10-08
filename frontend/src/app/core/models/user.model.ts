export type UserRole = 'ADMIN' | 'SISWA';

export interface AppUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AppUser;
}
