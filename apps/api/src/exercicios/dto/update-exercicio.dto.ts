import { GrupoMuscular } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdateExercicioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEnum(GrupoMuscular)
  grupoMuscular?: GrupoMuscular;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
