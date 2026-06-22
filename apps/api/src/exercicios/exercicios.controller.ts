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
import { GrupoMuscular, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateExercicioDto } from './dto/create-exercicio.dto';
import { UpdateExercicioDto } from './dto/update-exercicio.dto';
import { ExerciciosService } from './exercicios.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercicios')
export class ExerciciosController {
  constructor(private readonly exerciciosService: ExerciciosService) {}

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Post()
  create(@Body() createExercicioDto: CreateExercicioDto) {
    return this.exerciciosService.create(createExercicioDto);
  }

  @Roles(
    UserRole.ADMIN_ACADEMIA,
    UserRole.RECEPCAO,
    UserRole.INSTRUTOR,
    UserRole.ALUNO,
  )
  @Get()
  findAll(@Query('grupoMuscular') grupoMuscular?: GrupoMuscular) {
    return this.exerciciosService.findAll({ grupoMuscular });
  }

  @Roles(
    UserRole.ADMIN_ACADEMIA,
    UserRole.RECEPCAO,
    UserRole.INSTRUTOR,
    UserRole.ALUNO,
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciciosService.findOne(id);
  }

  @Roles(UserRole.ADMIN_ACADEMIA, UserRole.INSTRUTOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExercicioDto: UpdateExercicioDto,
  ) {
    return this.exerciciosService.update(id, updateExercicioDto);
  }

  @Roles(UserRole.ADMIN_ACADEMIA)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exerciciosService.remove(id);
  }
}
