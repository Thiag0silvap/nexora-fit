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
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: loginDto.email,
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
      email: usuario.email,
      role: usuario.role,
      academiaId: usuario.academiaId,
      instrutorId: usuario.instrutor?.id,
    };

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
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
      user,
    };
  }
}
