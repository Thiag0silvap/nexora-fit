import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { MobileService } from './mobile.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ALUNO)
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('meu-treino')
  getMeuTreino(@CurrentUser() user: AuthUser) {
    return this.mobileService.getMeuTreino(user);
  }

  @Get('meu-perfil')
  getMeuPerfil(@CurrentUser() user: AuthUser) {
    return this.mobileService.getMeuPerfil(user);
  }
}
