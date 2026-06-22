import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatusFicha, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { CreateDivisaoTreinoDto } from './dto/create-divisao-treino.dto';
import { CreateExercicioDivisaoDto } from './dto/create-exercicio-divisao.dto';
import { CreateFichaTreinoDto } from './dto/create-ficha-treino.dto';
import { DuplicateFichaTreinoDto } from './dto/duplicate-ficha-treino.dto';
import { UpdateDivisaoTreinoDto } from './dto/update-divisao-treino.dto';
import { UpdateExercicioDivisaoDto } from './dto/update-exercicio-divisao.dto';
import { UpdateFichaTreinoDto } from './dto/update-ficha-treino.dto';
import { FichasTreinoService } from './fichas-treino.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fichas-treino')
export class FichasTreinoController {
  constructor(private readonly fichasTreinoService: FichasTreinoService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createFichaTreinoDto: CreateFichaTreinoDto,
  ) {
    return this.fichasTreinoService.create(user, createFichaTreinoDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO, UserRole.INSTRUTOR)
  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('alunoId') alunoId?: string,
    @Query('instrutorId') instrutorId?: string,
    @Query('status') status?: StatusFicha,
  ) {
    return this.fichasTreinoService.findAll(user, {
      alunoId,
      instrutorId,
      status,
    });
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post(':id/duplicar')
  duplicate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() duplicateFichaTreinoDto: DuplicateFichaTreinoDto,
  ) {
    return this.fichasTreinoService.duplicate(
      user,
      id,
      duplicateFichaTreinoDto,
    );
  }

  @Roles(
    UserRole.ADMIN_ACADEMIA,
    UserRole.RECEPCAO,
    UserRole.INSTRUTOR,
    UserRole.ALUNO,
  )
  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.fichasTreinoService.findOne(user, id);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateFichaTreinoDto: UpdateFichaTreinoDto,
  ) {
    return this.fichasTreinoService.update(user, id, updateFichaTreinoDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.fichasTreinoService.remove(user, id);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post(':id/divisoes')
  createDivisao(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() createDivisaoTreinoDto: CreateDivisaoTreinoDto,
  ) {
    return this.fichasTreinoService.createDivisao(
      user,
      id,
      createDivisaoTreinoDto,
    );
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('divisoes-treino')
export class DivisoesTreinoController {
  constructor(private readonly fichasTreinoService: FichasTreinoService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post(':id/exercicios')
  createExercicioDivisao(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() createExercicioDivisaoDto: CreateExercicioDivisaoDto,
  ) {
    return this.fichasTreinoService.createExercicioDivisao(
      user,
      id,
      createExercicioDivisaoDto,
    );
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Patch(':id')
  updateDivisao(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateDivisaoTreinoDto: UpdateDivisaoTreinoDto,
  ) {
    return this.fichasTreinoService.updateDivisao(
      user,
      id,
      updateDivisaoTreinoDto,
    );
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Delete(':id')
  removeDivisao(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.fichasTreinoService.removeDivisao(user, id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercicios-divisao')
export class ExerciciosDivisaoController {
  constructor(private readonly fichasTreinoService: FichasTreinoService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Patch(':id')
  updateExercicioDivisao(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateExercicioDivisaoDto: UpdateExercicioDivisaoDto,
  ) {
    return this.fichasTreinoService.updateExercicioDivisao(
      user,
      id,
      updateExercicioDivisaoDto,
    );
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Delete(':id')
  removeExercicioDivisao(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.fichasTreinoService.removeExercicioDivisao(user, id);
  }
}
