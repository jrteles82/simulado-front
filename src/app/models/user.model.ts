export type Role = 'USER' | 'ADMIN';
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: string;
  providerId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
