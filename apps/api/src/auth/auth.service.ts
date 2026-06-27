import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser, JwtPayload } from './types/auth-user.type';

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me';
const refreshSecret =
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me';
const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
  '15m') as JwtSignOptions['expiresIn'];
const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
  '7d') as JwtSignOptions['expiresIn'];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const identificador = loginDto.identificador ?? loginDto.email;

    if (!identificador) {
      throw new UnauthorizedException('Informe usuario ou email.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { username: identificador },
          { email: identificador },
        ],
      },
      include: {
        instrutor: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!usuario?.ativo) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const user: AuthUser = {
      id: usuario.id,
      nome: usuario.nome,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
      academiaId: usuario.academiaId,
      instrutorId: usuario.instrutor?.id,
    };

    return {
      ...(await this.createTokens(user)),
      user,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });

      const usuario = await this.prisma.usuario.findFirst({
        where: {
          id: payload.sub,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
          role: true,
          academiaId: true,
          instrutor: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!usuario) {
        throw new UnauthorizedException('Sessao expirada.');
      }

      const user: AuthUser = {
        id: usuario.id,
        nome: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role,
        academiaId: usuario.academiaId,
        instrutorId: usuario.instrutor?.id,
      };

      return {
        ...(await this.createTokens(user)),
        user,
      };
    } catch {
      throw new UnauthorizedException('Sessao expirada.');
    }
  }

  private async createTokens(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      academiaId: user.academiaId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
