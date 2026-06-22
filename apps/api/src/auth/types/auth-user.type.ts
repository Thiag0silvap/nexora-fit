import { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  academiaId: string;
  instrutorId?: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  academiaId: string;
};
