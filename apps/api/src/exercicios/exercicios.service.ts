import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GrupoMuscular, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercicioDto } from './dto/create-exercicio.dto';
import { UpdateExercicioDto } from './dto/update-exercicio.dto';

@Injectable()
export class ExerciciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExercicioDto: CreateExercicioDto) {
    await this.ensureNomeIsAvailable(createExercicioDto.nome);

    try {
      return await this.prisma.exercicio.create({
        data: {
          nome: createExercicioDto.nome,
          grupoMuscular: createExercicioDto.grupoMuscular,
          descricao: createExercicioDto.descricao,
          videoUrl: createExercicioDto.videoUrl,
          ativo: true,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  findAll(filters: { grupoMuscular?: GrupoMuscular }) {
    this.validateGrupoMuscular(filters.grupoMuscular);

    return this.prisma.exercicio.findMany({
      where: {
        ativo: true,
        grupoMuscular: filters.grupoMuscular,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const exercicio = await this.prisma.exercicio.findFirst({
      where: {
        id,
        ativo: true,
      },
    });

    if (!exercicio) {
      throw new NotFoundException('Exercício não encontrado.');
    }

    return exercicio;
  }

  async update(id: string, updateExercicioDto: UpdateExercicioDto) {
    await this.findActiveExercicio(id);
    this.validateGrupoMuscular(updateExercicioDto.grupoMuscular);

    if (updateExercicioDto.nome) {
      await this.ensureNomeIsAvailable(updateExercicioDto.nome, id);
    }

    try {
      return await this.prisma.exercicio.update({
        where: {
          id,
        },
        data: {
          nome: updateExercicioDto.nome,
          grupoMuscular: updateExercicioDto.grupoMuscular,
          descricao: updateExercicioDto.descricao,
          videoUrl: updateExercicioDto.videoUrl,
          ativo: updateExercicioDto.ativo,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.findActiveExercicio(id);

    return this.prisma.exercicio.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }

  private async findActiveExercicio(id: string) {
    const exercicio = await this.prisma.exercicio.findFirst({
      where: {
        id,
        ativo: true,
      },
      select: {
        id: true,
      },
    });

    if (!exercicio) {
      throw new NotFoundException('Exercício não encontrado.');
    }

    return exercicio;
  }

  private async ensureNomeIsAvailable(nome: string, ignoredExercicioId?: string) {
    const exercicio = await this.prisma.exercicio.findUnique({
      where: {
        nome,
      },
      select: {
        id: true,
      },
    });

    if (exercicio && exercicio.id !== ignoredExercicioId) {
      throw new ConflictException('Nome de exercício já cadastrado.');
    }
  }

  private validateGrupoMuscular(grupoMuscular?: GrupoMuscular) {
    if (!grupoMuscular) {
      return;
    }

    if (!Object.values(GrupoMuscular).includes(grupoMuscular)) {
      throw new BadRequestException('Grupo muscular inválido.');
    }
  }

  private handleUniqueConstraintError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : undefined;

      if (target?.includes('nome')) {
        throw new ConflictException('Nome de exercício já cadastrado.');
      }

      throw new ConflictException('Registro duplicado.');
    }
  }
}
