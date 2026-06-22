import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { ReactivateAlunoDto } from './dto/reactivate-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() createAlunoDto: CreateAlunoDto) {
    return this.alunosService.create(user, createAlunoDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO, UserRole.INSTRUTOR)
  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.alunosService.findAll(user, status);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Get('inativo')
  findInactiveByEmail(@CurrentUser() user: AuthUser, @Query('email') email: string) {
    return this.alunosService.findInactiveByEmail(user, email);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Patch(':id/reativar')
  reactivate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() reactivateAlunoDto: ReactivateAlunoDto,
  ) {
    return this.alunosService.reactivate(user, id, reactivateAlunoDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO, UserRole.INSTRUTOR)
  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.alunosService.findOne(user, id);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateAlunoDto: UpdateAlunoDto,
  ) {
    return this.alunosService.update(user, id, updateAlunoDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.RECEPCAO)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.alunosService.remove(user, id);
  }
}
