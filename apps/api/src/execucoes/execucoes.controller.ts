import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { CreateExecucaoDto } from './dto/create-execucao.dto';
import { ExecucoesService } from './execucoes.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ALUNO)
@Controller('execucoes')
export class ExecucoesController {
  constructor(private readonly execucoesService: ExecucoesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createExecucaoDto: CreateExecucaoDto,
  ) {
    return this.execucoesService.create(user, createExecucaoDto);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.execucoesService.findMine(user);
  }

  @Get('hoje')
  findToday(@CurrentUser() user: AuthUser) {
    return this.execucoesService.findToday(user);
  }

  @Get('exercicio/:id/evolucao')
  findExerciseEvolution(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.execucoesService.findExerciseEvolution(user, id);
  }

  @Get('exercicio/:id')
  findMineByExercise(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.execucoesService.findMineByExercise(user, id);
  }

  @Get('exercicio-divisao/:id/ultima')
  findLatestByWorkoutExercise(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.execucoesService.findLatestByWorkoutExercise(user, id);
  }
}
