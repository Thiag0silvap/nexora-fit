import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstrutorDto } from './dto/create-instrutor.dto';
import { UpdateInstrutorDto } from './dto/update-instrutor.dto';
import { ReactivateInstrutorDto } from './dto/reactivate-instrutor.dto';

const instrutorSelect = {
  id: true,
  cref: true,
  especialidade: true,
  ativo: true,
  usuario: {
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.InstrutorSelect;

@Injectable()
export class InstrutoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, createInstrutorDto: CreateInstrutorDto) {
    await this.ensureEmailIsAvailable(createInstrutorDto.email);
    await this.ensureCrefIsAvailable(createInstrutorDto.cref);

    const senhaHash = await bcrypt.hash(createInstrutorDto.senha, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            academiaId: user.academiaId,
            nome: createInstrutorDto.nome,
            email: createInstrutorDto.email,
            senhaHash,
            role: UserRole.INSTRUTOR,
            ativo: true,
          },
        });

        return tx.instrutor.create({
          data: {
            usuarioId: usuario.id,
            cref: createInstrutorDto.cref,
            especialidade: createInstrutorDto.especialidade,
            ativo: true,
          },
          select: instrutorSelect,
        });
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  findAll(user: AuthUser, status?: string) {
    const ativo = this.resolveStatusFilter(status);

    return this.prisma.instrutor.findMany({
      where: {
        ativo,
        usuario: {
          academiaId: user.academiaId,
          ativo,
        },
      },
      select: instrutorSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findInactiveByEmail(user: AuthUser, email: string) {
    if (!email) return null;

    return this.prisma.instrutor.findFirst({
      where: {
        ativo: false,
        usuario: {
          academiaId: user.academiaId,
          email,
          role: UserRole.INSTRUTOR,
          ativo: false,
        },
      },
      select: instrutorSelect,
    });
  }

  async reactivate(user: AuthUser, id: string, dto: ReactivateInstrutorDto) {
    const instrutor = await this.prisma.instrutor.findFirst({
      where: {
        id,
        ativo: false,
        usuario: { academiaId: user.academiaId, role: UserRole.INSTRUTOR },
      },
      select: { usuarioId: true },
    });

    if (!instrutor) {
      throw new NotFoundException('Instrutor inativo nao encontrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: instrutor.usuarioId },
        data: { ativo: true, senhaHash },
      });

      return tx.instrutor.update({
        where: { id },
        data: { ativo: true },
        select: instrutorSelect,
      });
    });
  }

  async findOne(user: AuthUser, id: string) {
    const instrutor = await this.prisma.instrutor.findFirst({
      where: {
        id,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: {
        ...instrutorSelect,
        usuarioId: true,
      },
    });

    if (!instrutor) {
      throw new NotFoundException('Instrutor nao encontrado.');
    }

    if (user.role === UserRole.INSTRUTOR && instrutor.usuarioId !== user.id) {
      throw new ForbiddenException('Acesso negado ao instrutor informado.');
    }

    const { usuarioId: _usuarioId, ...response } = instrutor;
    return response;
  }

  async update(
    user: AuthUser,
    id: string,
    updateInstrutorDto: UpdateInstrutorDto,
  ) {
    const instrutor = await this.findInstrutorForAcademia(user, id);

    if (updateInstrutorDto.email) {
      await this.ensureEmailIsAvailable(
        updateInstrutorDto.email,
        instrutor.usuarioId,
      );
    }

    if (updateInstrutorDto.cref) {
      await this.ensureCrefIsAvailable(updateInstrutorDto.cref, instrutor.id);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (
          updateInstrutorDto.nome !== undefined ||
          updateInstrutorDto.email !== undefined ||
          updateInstrutorDto.ativo !== undefined
        ) {
          await tx.usuario.update({
            where: {
              id: instrutor.usuarioId,
            },
            data: {
              nome: updateInstrutorDto.nome,
              email: updateInstrutorDto.email,
              ativo: updateInstrutorDto.ativo,
            },
          });
        }

        return tx.instrutor.update({
          where: {
            id,
          },
          data: {
            cref: updateInstrutorDto.cref,
            especialidade: updateInstrutorDto.especialidade,
            ativo: updateInstrutorDto.ativo,
          },
          select: instrutorSelect,
        });
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(user: AuthUser, id: string) {
    const instrutor = await this.findInstrutorForAcademia(user, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: {
          id: instrutor.usuarioId,
        },
        data: {
          ativo: false,
        },
      });

      return tx.instrutor.update({
        where: {
          id,
        },
        data: {
          ativo: false,
        },
        select: instrutorSelect,
      });
    });
  }

  private async findInstrutorForAcademia(user: AuthUser, id: string) {
    const instrutor = await this.prisma.instrutor.findFirst({
      where: {
        id,
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
      throw new NotFoundException('Instrutor nao encontrado.');
    }

    return instrutor;
  }

  private async ensureEmailIsAvailable(email: string, ignoredUsuarioId?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (usuario && usuario.id !== ignoredUsuarioId) {
      throw new ConflictException('Email ja cadastrado.');
    }
  }

  private async ensureCrefIsAvailable(cref?: string, ignoredInstrutorId?: string) {
    if (!cref) {
      return;
    }

    const instrutor = await this.prisma.instrutor.findFirst({
      where: {
        cref,
      },
      select: {
        id: true,
      },
    });

    if (instrutor && instrutor.id !== ignoredInstrutorId) {
      throw new ConflictException('CREF ja cadastrado.');
    }
  }

  private resolveStatusFilter(status?: string) {
    if (!status || status === 'ativos') return true;
    if (status === 'inativos') return false;
    if (status === 'todos') return undefined;
    throw new ConflictException('Filtro de status invalido.');
  }

  private handleUniqueConstraintError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : undefined;

      if (target?.includes('email')) {
        throw new ConflictException('Email ja cadastrado.');
      }

      if (target?.includes('cref')) {
        throw new ConflictException('CREF ja cadastrado.');
      }

      throw new ConflictException('Registro duplicado.');
    }
  }
}
