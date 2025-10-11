export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;          // cuid do Prisma
  email: string;
  name?: string;
  picture?: string;
  provider: string;    // 'google', etc.
  providerId: string;  // id do provedor
  role: Role;
  createdAt: string;   // ISO string; parse p/ Date se quiser
  updatedAt: string;
}
