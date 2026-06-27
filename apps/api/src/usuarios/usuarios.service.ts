import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        academiaId: true,
        nome: true,
        username: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
