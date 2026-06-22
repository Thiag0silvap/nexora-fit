import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusFicha } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';

const fichaMobileInclude = {
  aluno: {
    select: {
      id: true,
      matricula: true,
      objetivo: true,
      altura: true,
      pesoAtual: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
  instrutor: {
    select: {
      id: true,
      cref: true,
      especialidade: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
  divisoes: {
    orderBy: {
      ordem: 'asc',
    },
    include: {
      exerciciosDivisao: {
        orderBy: {
          ordem: 'asc',
        },
        include: {
          exercicio: true,
        },
      },
    },
  },
} satisfies Prisma.FichaTreinoInclude;

@Injectable()
export class MobileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeuTreino(user: AuthUser) {
    const aluno = await this.findAlunoByUser(user);

    const ficha = await this.prisma.fichaTreino.findFirst({
      where: {
        alunoId: aluno.id,
        status: StatusFicha.ATIVA,
        aluno: {
          ativo: true,
          usuario: {
            id: user.id,
            academiaId: user.academiaId,
            ativo: true,
          },
        },
      },
      include: fichaMobileInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!ficha) {
      throw new NotFoundException('Aluno nao possui ficha de treino ativa.');
    }

    return ficha;
  }

  async getMeuPerfil(user: AuthUser) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        usuarioId: user.id,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: {
        id: true,
        matricula: true,
        dataNascimento: true,
        sexo: true,
        altura: true,
        pesoAtual: true,
        objetivo: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        usuarioId: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException('Perfil de aluno nao encontrado.');
    }

    const academia = await this.prisma.academia.findFirst({
      where: {
        id: user.academiaId,
        ativa: true,
      },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        email: true,
        telefone: true,
        ativa: true,
      },
    });

    const { usuarioId: _usuarioId, usuario, ...dadosAluno } = aluno;

    return {
      usuario,
      aluno: dadosAluno,
      academia,
    };
  }

  private async findAlunoByUser(user: AuthUser) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        usuarioId: user.id,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: {
        id: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException('Perfil de aluno nao encontrado.');
    }

    return aluno;
  }
}
