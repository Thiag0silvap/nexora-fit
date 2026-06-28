import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoFisicaDto } from './dto/create-avaliacao-fisica.dto';

const avaliacaoFisicaSelect = {
  id: true,
  alunoId: true,
  peso: true,
  observacao: true,
  createdAt: true,
  aluno: {
    select: {
      id: true,
      matricula: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
        },
      },
    },
  },
  medidasCorporais: true,
} satisfies Prisma.AvaliacaoFisicaSelect;

@Injectable()
export class AvaliacoesFisicasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, createAvaliacaoFisicaDto: CreateAvaliacaoFisicaDto) {
    await this.ensureCanAccessAluno(user, createAvaliacaoFisicaDto.alunoId);

    return this.prisma.avaliacaoFisica.create({
      data: {
        alunoId: createAvaliacaoFisicaDto.alunoId,
        peso: createAvaliacaoFisicaDto.peso,
        observacao: createAvaliacaoFisicaDto.observacao,
        medidasCorporais: createAvaliacaoFisicaDto.medidas
          ? {
              create: createAvaliacaoFisicaDto.medidas,
            }
          : undefined,
      },
      select: avaliacaoFisicaSelect,
    });
  }

  async findByAluno(user: AuthUser, alunoId: string) {
    await this.ensureCanAccessAluno(user, alunoId);

    return this.prisma.avaliacaoFisica.findMany({
      where: {
        alunoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: avaliacaoFisicaSelect,
    });
  }

  async findLatestByAluno(user: AuthUser, alunoId: string) {
    await this.ensureCanAccessAluno(user, alunoId);

    return this.prisma.avaliacaoFisica.findFirst({
      where: {
        alunoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: avaliacaoFisicaSelect,
    });
  }

  private async ensureCanAccessAluno(user: AuthUser, alunoId: string) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        id: alunoId,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
          id: user.role === UserRole.ALUNO ? user.id : undefined,
        },
      },
      select: {
        id: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }

    return aluno;
  }
}
