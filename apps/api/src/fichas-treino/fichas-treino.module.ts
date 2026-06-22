import { Module } from '@nestjs/common';
import {
  DivisoesTreinoController,
  ExerciciosDivisaoController,
  FichasTreinoController,
} from './fichas-treino.controller';
import { FichasTreinoService } from './fichas-treino.service';

@Module({
  controllers: [
    FichasTreinoController,
    DivisoesTreinoController,
    ExerciciosDivisaoController,
  ],
  providers: [FichasTreinoService],
})
export class FichasTreinoModule {}
