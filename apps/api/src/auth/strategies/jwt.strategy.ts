import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, JwtPayload } from '../types/auth-user.type';

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
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
      throw new UnauthorizedException('Usuario nao encontrado ou inativo.');
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
      academiaId: usuario.academiaId,
      instrutorId: usuario.instrutor?.id,
    };
  }
}
