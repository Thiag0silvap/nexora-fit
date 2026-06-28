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
    const exercicioDivisao = await this.ensureExercicioDivisaoBelongsToActiveWorkout(
      aluno.id,
      createExecucaoDto.exercicioDivisaoId,
    );

    return this.prisma.$transaction(async (tx) => {
      const execucao = await tx.execucaoTreino.create({
        data: {
          alunoId: aluno.id,
          exercicioDivisaoId: createExecucaoDto.exercicioDivisaoId,
          carga: createExecucaoDto.carga,
          repeticoesRealizadas: createExecucaoDto.repeticoesRealizadas,
          observacao: createExecucaoDto.observacao,
        },
        include: execucaoInclude,
      });

      await this.updateAlunoExercicioEvolucao(tx, {
        alunoId: aluno.id,
        exercicioId: exercicioDivisao.exercicioId,
        carga: execucao.carga,
        repeticoesRealizadas: execucao.repeticoesRealizadas,
        observacao: execucao.observacao,
        executadoEm: execucao.executadoEm,
      });

      return execucao;
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

  async findExerciseEvolution(user: AuthUser, exercicioId: string) {
    const aluno = await this.findAlunoByUser(user);
    await this.ensureExercicioAtivo(exercicioId);

    const evolucao = await this.prisma.alunoExercicioEvolucao.findUnique({
      where: {
        alunoId_exercicioId: {
          alunoId: aluno.id,
          exercicioId,
        },
      },
    });

    if (!evolucao) {
      return null;
    }

    return this.mapEvolucao(evolucao);
  }

  async findLatestByWorkoutExercise(user: AuthUser, exercicioDivisaoId: string) {
    const aluno = await this.findAlunoByUser(user);
    const exercicioDivisao = await this.ensureExercicioDivisaoBelongsToActiveWorkout(
      aluno.id,
      exercicioDivisaoId,
    );

    const evolucao = await this.prisma.alunoExercicioEvolucao.findUnique({
      where: {
        alunoId_exercicioId: {
          alunoId: aluno.id,
          exercicioId: exercicioDivisao.exercicioId,
        },
      },
    });

    if (!evolucao) {
      return null;
    }

    return this.mapEvolucao(evolucao);
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
      throw new NotFoundException('Perfil de aluno não encontrado.');
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
        exercicioId: true,
      },
    });

    if (!exercicioDivisao) {
      throw new NotFoundException(
        'Exercício da divisão não encontrado para a ficha ativa do aluno.',
      );
    }

    return exercicioDivisao;
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
      throw new NotFoundException('Exercício não encontrado ou inativo.');
    }
  }

  private async updateAlunoExercicioEvolucao(
    tx: Prisma.TransactionClient,
    data: {
      alunoId: string;
      exercicioId: string;
      carga: Prisma.Decimal;
      repeticoesRealizadas: number;
      observacao?: string | null;
      executadoEm: Date;
    },
  ) {
    const evolucaoAtual = await tx.alunoExercicioEvolucao.findUnique({
      where: {
        alunoId_exercicioId: {
          alunoId: data.alunoId,
          exercicioId: data.exercicioId,
        },
      },
    });

    if (!evolucaoAtual) {
      await tx.alunoExercicioEvolucao.create({
        data: {
          alunoId: data.alunoId,
          exercicioId: data.exercicioId,
          ultimaCarga: data.carga,
          melhorCarga: data.carga,
          ultimaRepeticao: data.repeticoesRealizadas,
          melhorRepeticao: data.repeticoesRealizadas,
          ultimaExecucao: data.executadoEm,
          melhorCargaExecutadaEm: data.executadoEm,
          observacaoUltima: data.observacao,
          quantidadeExecucoes: 1,
        },
      });
      return;
    }

    const novaCargaEhMelhor =
      Number(data.carga) >= Number(evolucaoAtual.melhorCarga);

    await tx.alunoExercicioEvolucao.update({
      where: {
        id: evolucaoAtual.id,
      },
      data: {
        ultimaCarga: data.carga,
        ultimaRepeticao: data.repeticoesRealizadas,
        ultimaExecucao: data.executadoEm,
        observacaoUltima: data.observacao,
        quantidadeExecucoes: {
          increment: 1,
        },
        melhorCarga: novaCargaEhMelhor ? data.carga : undefined,
        melhorRepeticao: novaCargaEhMelhor
          ? data.repeticoesRealizadas
          : undefined,
        melhorCargaExecutadaEm: novaCargaEhMelhor
          ? data.executadoEm
          : undefined,
      },
    });
  }

  private mapEvolucao(
    evolucao: Prisma.AlunoExercicioEvolucaoGetPayload<Record<string, never>>,
  ) {
    return {
      ultimaCarga: Number(evolucao.ultimaCarga),
      melhorCarga: Number(evolucao.melhorCarga),
      ultimaRepeticao: evolucao.ultimaRepeticao,
      melhorRepeticao: evolucao.melhorRepeticao,
      ultimaExecucao: evolucao.ultimaExecucao.toISOString(),
      melhorCargaExecutadaEm: evolucao.melhorCargaExecutadaEm.toISOString(),
      observacao: evolucao.observacaoUltima,
      quantidadeExecucoes: evolucao.quantidadeExecucoes,
    };
  }
}
