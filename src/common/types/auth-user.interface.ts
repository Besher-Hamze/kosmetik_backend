export type UserRole = 'superadmin' | 'admin' | 'editor';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}
