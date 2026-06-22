import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusFicha } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecucaoDto } from './dto/create-execucao.dto';

const execucaoInclude = {
  exercicioDivisao: {
    include: {
      exercicio: true,
      divisaoTreino: {
        select: {
          id: true,
          nome: true,
          ordem: true,
          fichaTreino: {
            select: {
              id: true,
              nome: true,
              status: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ExecucaoTreinoInclude;

@Injectable()
export class ExecucoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, createExecucaoDto: CreateExecucaoDto) {
    const aluno = await this.findAlunoByUser(user);
    await this.ensureExercicioDivisaoBelongsToActiveWorkout(
      aluno.id,
      createExecucaoDto.exercicioDivisaoId,
    );

    return this.prisma.execucaoTreino.create({
      data: {
        alunoId: aluno.id,
        exercicioDivisaoId: createExecucaoDto.exercicioDivisaoId,
        carga: createExecucaoDto.carga,
        repeticoesRealizadas: createExecucaoDto.repeticoesRealizadas,
        observacao: createExecucaoDto.observacao,
      },
      include: execucaoInclude,
    });
  }

  async findMine(user: AuthUser) {
    const aluno = await this.findAlunoByUser(user);

    return this.prisma.execucaoTreino.findMany({
      where: {
        alunoId: aluno.id,
      },
      include: execucaoInclude,
      orderBy: {
        executadoEm: 'desc',
      },
    });
  }

  async findToday(user: AuthUser) {
    const aluno = await this.findAlunoByUser(user);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const execucoes = await this.prisma.execucaoTreino.findMany({
      where: {
        alunoId: aluno.id,
        executadoEm: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        executadoEm: 'desc',
      },
      select: {
        id: true,
        exercicioDivisaoId: true,
        carga: true,
        repeticoesRealizadas: true,
        observacao: true,
        executadoEm: true,
      },
    });

    return execucoes.map((execucao) => ({
      ...execucao,
      carga: Number(execucao.carga),
      executadoEm: execucao.executadoEm.toISOString(),
    }));
  }

  async findMineByExercise(user: AuthUser, exercicioId: string) {
    const aluno = await this.findAlunoByUser(user);
    await this.ensureExercicioAtivo(exercicioId);

    return this.prisma.execucaoTreino.findMany({
      where: {
        alunoId: aluno.id,
        exercicioDivisao: {
          exercicioId,
        },
      },
      include: execucaoInclude,
      orderBy: {
        executadoEm: 'desc',
      },
    });
  }

  async findLatestByWorkoutExercise(user: AuthUser, exercicioDivisaoId: string) {
    const aluno = await this.findAlunoByUser(user);
    await this.ensureExercicioDivisaoBelongsToActiveWorkout(
      aluno.id,
      exercicioDivisaoId,
    );

    const ultimaExecucao = await this.prisma.execucaoTreino.findFirst({
      where: {
        alunoId: aluno.id,
        exercicioDivisaoId,
      },
      orderBy: {
        executadoEm: 'desc',
      },
      select: {
        carga: true,
        repeticoesRealizadas: true,
        executadoEm: true,
        observacao: true,
      },
    });

    if (!ultimaExecucao) {
      return null;
    }

    return {
      ultimaCarga: Number(ultimaExecucao.carga),
      ultimaRepeticao: ultimaExecucao.repeticoesRealizadas,
      ultimaExecucao: ultimaExecucao.executadoEm.toISOString(),
      observacao: ultimaExecucao.observacao,
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

  private async ensureExercicioDivisaoBelongsToActiveWorkout(
    alunoId: string,
    exercicioDivisaoId: string,
  ) {
    const exercicioDivisao = await this.prisma.exercicioDivisao.findFirst({
      where: {
        id: exercicioDivisaoId,
        divisaoTreino: {
          fichaTreino: {
            alunoId,
            status: StatusFicha.ATIVA,
          },
        },
        exercicio: {
          ativo: true,
        },
      },
      select: {
        id: true,
      },
    });

    if (!exercicioDivisao) {
      throw new NotFoundException(
        'Exercicio da divisao nao encontrado para a ficha ativa do aluno.',
      );
    }
  }

  private async ensureExercicioAtivo(exercicioId: string) {
    const exercicio = await this.prisma.exercicio.findFirst({
      where: {
        id: exercicioId,
        ativo: true,
      },
      select: {
        id: true,
      },
    });

    if (!exercicio) {
      throw new NotFoundException('Exercicio nao encontrado ou inativo.');
    }
  }
}
