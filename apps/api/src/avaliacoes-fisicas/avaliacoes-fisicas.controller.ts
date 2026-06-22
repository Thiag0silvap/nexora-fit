import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { AvaliacoesFisicasService } from './avaliacoes-fisicas.service';
import { CreateAvaliacaoFisicaDto } from './dto/create-avaliacao-fisica.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('avaliacoes-fisicas')
export class AvaliacoesFisicasController {
  constructor(private readonly avaliacoesFisicasService: AvaliacoesFisicasService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createAvaliacaoFisicaDto: CreateAvaliacaoFisicaDto,
  ) {
    return this.avaliacoesFisicasService.create(user, createAvaliacaoFisicaDto);
  }

  @Roles(
    UserRole.ADMIN_ACADEMIA,
    UserRole.RECEPCAO,
    UserRole.INSTRUTOR,
    UserRole.ALUNO,
  )
  @Get('aluno/:alunoId')
  findByAluno(@CurrentUser() user: AuthUser, @Param('alunoId') alunoId: string) {
    return this.avaliacoesFisicasService.findByAluno(user, alunoId);
  }

  @Roles(
    UserRole.ADMIN_ACADEMIA,
    UserRole.RECEPCAO,
    UserRole.INSTRUTOR,
    UserRole.ALUNO,
  )
  @Get('aluno/:alunoId/ultima')
  findLatestByAluno(
    @CurrentUser() user: AuthUser,
    @Param('alunoId') alunoId: string,
  ) {
    return this.avaliacoesFisicasService.findLatestByAluno(user, alunoId);
  }
}
