export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type AuthStatus = 'anonymous' | 'authenticated' | 'loading';
