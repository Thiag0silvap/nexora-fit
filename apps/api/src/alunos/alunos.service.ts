import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { ReactivateAlunoDto } from './dto/reactivate-aluno.dto';

const alunoSelect = {
  id: true,
  matricula: true,
  objetivo: true,
  altura: true,
  pesoAtual: true,
  ativo: true,
  usuario: {
    select: {
      id: true,
      nome: true,
      username: true,
      email: true,
    },
  },
} satisfies Prisma.AlunoSelect;

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, createAlunoDto: CreateAlunoDto) {
    const username = this.normalizeUsername(createAlunoDto.username);
    const email = this.normalizeEmail(createAlunoDto.email);

    await this.ensureUsernameIsAvailable(username);
    await this.ensureEmailIsAvailable(email);

    const senhaHash = await bcrypt.hash(createAlunoDto.senha, 10);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const matricula = await this.generateNextMatricula(tx);
          const usuario = await tx.usuario.create({
            data: {
              academiaId: user.academiaId,
              nome: createAlunoDto.nome,
              username,
              email,
              senhaHash,
              role: UserRole.ALUNO,
              ativo: true,
            },
          });

          return tx.aluno.create({
            data: {
              usuarioId: usuario.id,
              matricula,
              dataNascimento: createAlunoDto.dataNascimento
                ? new Date(createAlunoDto.dataNascimento)
                : undefined,
              sexo: createAlunoDto.sexo,
              altura: createAlunoDto.altura,
              pesoAtual: createAlunoDto.pesoAtual,
              objetivo: createAlunoDto.objetivo,
              ativo: true,
            },
            select: alunoSelect,
          });
        });
      } catch (error) {
        if (this.isMatriculaConflict(error) && attempt < 3) continue;
        this.handleUniqueConstraintError(error);
        throw error;
      }
    }

    throw new ConflictException('Não foi possível gerar uma matrícula única.');
  }

  findAll(user: AuthUser, status?: string) {
    const ativo = this.resolveStatusFilter(status);

    return this.prisma.aluno.findMany({
      where: {
        ativo,
        usuario: {
          academiaId: user.academiaId,
          ativo,
        },
      },
      select: alunoSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findInactiveByIdentifier(user: AuthUser, identifier?: string) {
    if (!identifier) return null;

    const normalizedUsername = this.normalizeUsername(identifier);
    const email = this.normalizeEmail(identifier);

    return this.prisma.aluno.findFirst({
      where: {
        ativo: false,
        usuario: {
          academiaId: user.academiaId,
          role: UserRole.ALUNO,
          ativo: false,
          OR: [
            { username: normalizedUsername },
            ...(email ? [{ email }] : []),
          ],
        },
      },
      select: alunoSelect,
    });
  }

  async reactivate(user: AuthUser, id: string, dto: ReactivateAlunoDto) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        id,
        ativo: false,
        usuario: { academiaId: user.academiaId, role: UserRole.ALUNO },
      },
      select: { usuarioId: true },
    });

    if (!aluno) throw new NotFoundException('Aluno inativo não encontrado.');
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: aluno.usuarioId },
        data: { ativo: true, senhaHash },
      });

      return tx.aluno.update({
        where: { id },
        data: { ativo: true },
        select: alunoSelect,
      });
    });
  }

  async findOne(user: AuthUser, id: string) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        id,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: alunoSelect,
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }

    return aluno;
  }

  async update(user: AuthUser, id: string, updateAlunoDto: UpdateAlunoDto) {
    const aluno = await this.findAlunoForAcademia(user, id);
    const username =
      updateAlunoDto.username !== undefined
        ? this.normalizeUsername(updateAlunoDto.username)
        : undefined;
    const email =
      updateAlunoDto.email !== undefined
        ? this.normalizeEmail(updateAlunoDto.email)
        : undefined;

    if (username !== undefined) {
      await this.ensureUsernameIsAvailable(username, aluno.usuarioId);
    }

    if (email !== undefined) {
      await this.ensureEmailIsAvailable(email, aluno.usuarioId);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (
          updateAlunoDto.nome !== undefined ||
          updateAlunoDto.username !== undefined ||
          updateAlunoDto.email !== undefined ||
          updateAlunoDto.ativo !== undefined
        ) {
          await tx.usuario.update({
            where: {
              id: aluno.usuarioId,
            },
            data: {
              nome: updateAlunoDto.nome,
              username,
              email,
              ativo: updateAlunoDto.ativo,
            },
          });
        }

        return tx.aluno.update({
          where: {
            id,
          },
          data: {
            altura: updateAlunoDto.altura,
            pesoAtual: updateAlunoDto.pesoAtual,
            objetivo: updateAlunoDto.objetivo,
            ativo: updateAlunoDto.ativo,
          },
          select: alunoSelect,
        });
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(user: AuthUser, id: string) {
    const aluno = await this.findAlunoForAcademia(user, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: {
          id: aluno.usuarioId,
        },
        data: {
          ativo: false,
        },
      });

      return tx.aluno.update({
        where: {
          id,
        },
        data: {
          ativo: false,
        },
        select: alunoSelect,
      });
    });
  }

  private async findAlunoForAcademia(user: AuthUser, id: string) {
    const aluno = await this.prisma.aluno.findFirst({
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

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }

    return aluno;
  }

  private async ensureUsernameIsAvailable(username: string, ignoredUsuarioId?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (usuario && usuario.id !== ignoredUsuarioId) {
      throw new ConflictException('Usuário já cadastrado.');
    }
  }

  private async ensureEmailIsAvailable(email?: string | null, ignoredUsuarioId?: string) {
    if (!email) return;

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (usuario && usuario.id !== ignoredUsuarioId) {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }

  private normalizeUsername(username: string) {
    return username.trim().toLowerCase();
  }

  private normalizeEmail(email?: string | null) {
    const normalizedEmail = email?.trim().toLowerCase();
    return normalizedEmail || null;
  }

  private async generateNextMatricula(tx: Prisma.TransactionClient) {
    const lastAluno = await tx.aluno.findFirst({
      where: { matricula: { startsWith: 'ALU-' } },
      orderBy: { matricula: 'desc' },
      select: { matricula: true },
    });
    const lastNumber = lastAluno ? Number(lastAluno.matricula.slice(4)) : 0;
    return `ALU-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  private resolveStatusFilter(status?: string) {
    if (!status || status === 'ativos') return true;
    if (status === 'inativos') return false;
    if (status === 'todos') return undefined;
    throw new ConflictException('Filtro de status inválido.');
  }

  private isMatriculaConflict(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      String(error.meta?.target).includes('matricula');
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
        throw new ConflictException('E-mail já cadastrado.');
      }

      if (target?.includes('username')) {
        throw new ConflictException('Usuário já cadastrado.');
      }

      if (target?.includes('matricula')) {
        throw new ConflictException('Matrícula já cadastrada.');
      }

      throw new ConflictException('Registro duplicado.');
    }
  }
}
