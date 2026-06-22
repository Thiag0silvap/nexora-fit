import { GrupoMuscular } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateExercicioDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsEnum(GrupoMuscular)
  grupoMuscular: GrupoMuscular;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string;
}
