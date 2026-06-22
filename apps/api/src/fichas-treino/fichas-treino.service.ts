import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusFicha, UserRole } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDivisaoTreinoDto } from './dto/create-divisao-treino.dto';
import { CreateExercicioDivisaoDto } from './dto/create-exercicio-divisao.dto';
import { CreateFichaTreinoDto } from './dto/create-ficha-treino.dto';
import { DuplicateFichaTreinoDto } from './dto/duplicate-ficha-treino.dto';
import { UpdateDivisaoTreinoDto } from './dto/update-divisao-treino.dto';
import { UpdateExercicioDivisaoDto } from './dto/update-exercicio-divisao.dto';
import { UpdateFichaTreinoDto } from './dto/update-ficha-treino.dto';

const fichaResumoInclude = {
  aluno: {
    select: {
      id: true,
      matricula: true,
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
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.FichaTreinoInclude;

const fichaCompletaInclude = {
  ...fichaResumoInclude,
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
export class FichasTreinoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, createFichaTreinoDto: CreateFichaTreinoDto) {
    await this.ensureAlunoAtivoNaAcademia(user, createFichaTreinoDto.alunoId);
    await this.ensureInstrutorAtivoNaAcademia(
      user,
      createFichaTreinoDto.instrutorId,
    );
    await this.ensureCanWriteForInstrutor(user, createFichaTreinoDto.instrutorId);

    return this.prisma.$transaction(async (tx) => {
      await tx.fichaTreino.updateMany({
        where: {
          alunoId: createFichaTreinoDto.alunoId,
          status: StatusFicha.ATIVA,
        },
        data: {
          status: StatusFicha.ARQUIVADA,
        },
      });

      return tx.fichaTreino.create({
        data: {
          alunoId: createFichaTreinoDto.alunoId,
          instrutorId: createFichaTreinoDto.instrutorId,
          nome: createFichaTreinoDto.nome,
          observacao: createFichaTreinoDto.observacao,
          status: StatusFicha.ATIVA,
        },
        include: fichaCompletaInclude,
      });
    });
  }

  findAll(
    user: AuthUser,
    filters: {
      alunoId?: string;
      instrutorId?: string;
      status?: StatusFicha;
    },
  ) {
    this.validateStatus(filters.status);

    return this.prisma.fichaTreino.findMany({
      where: {
        alunoId: filters.alunoId,
        instrutorId:
          user.role === UserRole.INSTRUTOR
            ? undefined
            : filters.instrutorId,
        status: filters.status,
        aluno: {
          ativo: true,
          usuario: {
            academiaId: user.academiaId,
            ativo: true,
          },
        },
        instrutor: {
          ativo: true,
          usuario: {
            academiaId: user.academiaId,
            ativo: true,
            id: user.role === UserRole.INSTRUTOR ? user.id : undefined,
          },
          id:
            user.role === UserRole.INSTRUTOR
              ? filters.instrutorId
              : undefined,
        },
      },
      include: fichaResumoInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const ficha = await this.prisma.fichaTreino.findFirst({
      where: this.buildFichaAccessWhere(user, id),
      include: fichaCompletaInclude,
    });

    if (!ficha) {
      throw new NotFoundException('Ficha de treino nao encontrada.');
    }

    return ficha;
  }

  async update(
    user: AuthUser,
    id: string,
    updateFichaTreinoDto: UpdateFichaTreinoDto,
  ) {
    this.validateStatus(updateFichaTreinoDto.status);

    const ficha = await this.findFichaForWrite(user, id);

    return this.prisma.$transaction(async (tx) => {
      if (updateFichaTreinoDto.status === StatusFicha.ATIVA) {
        await tx.fichaTreino.updateMany({
          where: {
            alunoId: ficha.alunoId,
            status: StatusFicha.ATIVA,
            id: {
              not: id,
            },
          },
          data: {
            status: StatusFicha.ARQUIVADA,
          },
        });
      }

      return tx.fichaTreino.update({
        where: {
          id,
        },
        data: {
          nome: updateFichaTreinoDto.nome,
          observacao: updateFichaTreinoDto.observacao,
          status: updateFichaTreinoDto.status,
        },
        include: fichaCompletaInclude,
      });
    });
  }

  async remove(user: AuthUser, id: string) {
    await this.findFichaForWrite(user, id);

    return this.prisma.fichaTreino.update({
      where: {
        id,
      },
      data: {
        status: StatusFicha.ARQUIVADA,
      },
      include: fichaCompletaInclude,
    });
  }

  async duplicate(
    user: AuthUser,
    id: string,
    duplicateFichaTreinoDto: DuplicateFichaTreinoDto,
  ) {
    const originalFicha = await this.prisma.fichaTreino.findFirst({
      where: this.buildFichaAccessWhere(user, id),
      include: fichaCompletaInclude,
    });

    if (!originalFicha) {
      throw new NotFoundException('Ficha de treino nao encontrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.fichaTreino.updateMany({
        where: {
          alunoId: originalFicha.alunoId,
          status: StatusFicha.ATIVA,
        },
        data: {
          status: StatusFicha.ARQUIVADA,
        },
      });

      return tx.fichaTreino.create({
        data: {
          alunoId: originalFicha.alunoId,
          instrutorId: originalFicha.instrutorId,
          nome: duplicateFichaTreinoDto.nome,
          observacao: duplicateFichaTreinoDto.observacao,
          status: StatusFicha.ATIVA,
          divisoes: {
            create: originalFicha.divisoes.map((divisao) => ({
              nome: divisao.nome,
              ordem: divisao.ordem,
              exerciciosDivisao: {
                create: divisao.exerciciosDivisao.map((exercicioDivisao) => ({
                  exercicioId: exercicioDivisao.exercicioId,
                  series: exercicioDivisao.series,
                  repeticoes: exercicioDivisao.repeticoes,
                  descansoSegundos: exercicioDivisao.descansoSegundos,
                  observacao: exercicioDivisao.observacao,
                  ordem: exercicioDivisao.ordem,
                })),
              },
            })),
          },
        },
        include: fichaCompletaInclude,
      });
    });
  }

  async createDivisao(
    user: AuthUser,
    fichaTreinoId: string,
    createDivisaoTreinoDto: CreateDivisaoTreinoDto,
  ) {
    await this.findFichaForWrite(user, fichaTreinoId);

    try {
      return await this.prisma.divisaoTreino.create({
        data: {
          fichaTreinoId,
          nome: createDivisaoTreinoDto.nome,
          ordem: createDivisaoTreinoDto.ordem,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error, 'Ordem da divisao ja cadastrada.');
      throw error;
    }
  }

  async createExercicioDivisao(
    user: AuthUser,
    divisaoTreinoId: string,
    createExercicioDivisaoDto: CreateExercicioDivisaoDto,
  ) {
    await this.findDivisaoForWrite(user, divisaoTreinoId);
    await this.ensureExercicioAtivo(createExercicioDivisaoDto.exercicioId);

    try {
      return await this.prisma.exercicioDivisao.create({
        data: {
          divisaoTreinoId,
          exercicioId: createExercicioDivisaoDto.exercicioId,
          series: createExercicioDivisaoDto.series,
          repeticoes: createExercicioDivisaoDto.repeticoes,
          descansoSegundos: createExercicioDivisaoDto.descansoSegundos,
          observacao: createExercicioDivisaoDto.observacao,
          ordem: createExercicioDivisaoDto.ordem,
        },
        include: {
          exercicio: true,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(
        error,
        'Ordem do exercicio ja cadastrada nesta divisao.',
      );
      throw error;
    }
  }

  async updateDivisao(
    user: AuthUser,
    id: string,
    updateDivisaoTreinoDto: UpdateDivisaoTreinoDto,
  ) {
    await this.findDivisaoForWrite(user, id);

    try {
      return await this.prisma.divisaoTreino.update({
        where: { id },
        data: {
          nome: updateDivisaoTreinoDto.nome,
          ordem: updateDivisaoTreinoDto.ordem,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error, 'Ordem da divisao ja cadastrada.');
      throw error;
    }
  }

  async removeDivisao(user: AuthUser, id: string) {
    await this.findDivisaoForWrite(user, id);

    return this.prisma.divisaoTreino.delete({
      where: { id },
    });
  }

  async updateExercicioDivisao(
    user: AuthUser,
    id: string,
    updateExercicioDivisaoDto: UpdateExercicioDivisaoDto,
  ) {
    await this.findExercicioDivisaoForWrite(user, id);

    try {
      return await this.prisma.exercicioDivisao.update({
        where: { id },
        data: {
          series: updateExercicioDivisaoDto.series,
          repeticoes: updateExercicioDivisaoDto.repeticoes,
          descansoSegundos: updateExercicioDivisaoDto.descansoSegundos,
          observacao: updateExercicioDivisaoDto.observacao,
          ordem: updateExercicioDivisaoDto.ordem,
        },
        include: {
          exercicio: true,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(
        error,
        'Ordem do exercicio ja cadastrada nesta divisao.',
      );
      throw error;
    }
  }

  async removeExercicioDivisao(user: AuthUser, id: string) {
    await this.findExercicioDivisaoForWrite(user, id);

    return this.prisma.exercicioDivisao.delete({
      where: { id },
      include: {
        exercicio: true,
      },
    });
  }

  private buildFichaAccessWhere(user: AuthUser, id: string): Prisma.FichaTreinoWhereInput {
    return {
      id,
      aluno: {
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
          id: user.role === UserRole.ALUNO ? user.id : undefined,
        },
      },
      instrutor: {
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
          id: user.role === UserRole.INSTRUTOR ? user.id : undefined,
        },
      },
    };
  }

  private async findFichaForWrite(user: AuthUser, id: string) {
    const ficha = await this.prisma.fichaTreino.findFirst({
      where: {
        id,
        aluno: {
          ativo: true,
          usuario: {
            academiaId: user.academiaId,
            ativo: true,
          },
        },
        instrutor: {
          ativo: true,
          usuario: {
            academiaId: user.academiaId,
            ativo: true,
            id: user.role === UserRole.INSTRUTOR ? user.id : undefined,
          },
        },
      },
      select: {
        id: true,
        alunoId: true,
        instrutorId: true,
      },
    });

    if (!ficha) {
      throw new NotFoundException('Ficha de treino nao encontrada.');
    }

    return ficha;
  }

  private async findDivisaoForWrite(user: AuthUser, id: string) {
    const divisao = await this.prisma.divisaoTreino.findFirst({
      where: {
        id,
        fichaTreino: {
          aluno: {
            ativo: true,
            usuario: {
              academiaId: user.academiaId,
              ativo: true,
            },
          },
          instrutor: {
            ativo: true,
            usuario: {
              academiaId: user.academiaId,
              ativo: true,
              id: user.role === UserRole.INSTRUTOR ? user.id : undefined,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!divisao) {
      throw new NotFoundException('Divisao de treino nao encontrada.');
    }

    return divisao;
  }

  private async findExercicioDivisaoForWrite(user: AuthUser, id: string) {
    const exercicioDivisao = await this.prisma.exercicioDivisao.findFirst({
      where: {
        id,
        divisaoTreino: {
          fichaTreino: {
            aluno: {
              ativo: true,
              usuario: {
                academiaId: user.academiaId,
                ativo: true,
              },
            },
            instrutor: {
              ativo: true,
              usuario: {
                academiaId: user.academiaId,
                ativo: true,
                id: user.role === UserRole.INSTRUTOR ? user.id : undefined,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!exercicioDivisao) {
      throw new NotFoundException('Exercicio da divisao nao encontrado.');
    }

    return exercicioDivisao;
  }

  private async ensureAlunoAtivoNaAcademia(user: AuthUser, alunoId: string) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        id: alunoId,
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
      throw new NotFoundException('Aluno nao encontrado ou inativo.');
    }
  }

  private async ensureInstrutorAtivoNaAcademia(
    user: AuthUser,
    instrutorId: string,
  ) {
    const instrutor = await this.prisma.instrutor.findFirst({
      where: {
        id: instrutorId,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: {
        id: true,
        usuarioId: true,
      },
    });

    if (!instrutor) {
      throw new NotFoundException('Instrutor nao encontrado ou inativo.');
    }

    return instrutor;
  }

  private async ensureCanWriteForInstrutor(user: AuthUser, instrutorId: string) {
    if (user.role !== UserRole.INSTRUTOR) {
      return;
    }

    const instrutor = await this.ensureInstrutorAtivoNaAcademia(user, instrutorId);

    if (instrutor.usuarioId !== user.id) {
      throw new ForbiddenException('Instrutor so pode gerenciar as proprias fichas.');
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

  private validateStatus(status?: StatusFicha) {
    if (!status) {
      return;
    }

    if (!Object.values(StatusFicha).includes(status)) {
      throw new BadRequestException('Status da ficha invalido.');
    }
  }

  private handleUniqueConstraintError(error: unknown, message: string) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
  }
}
