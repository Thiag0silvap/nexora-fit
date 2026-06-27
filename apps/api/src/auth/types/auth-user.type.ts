import { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  role: UserRole;
  academiaId: string;
  instrutorId?: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
  academiaId: string;
};
