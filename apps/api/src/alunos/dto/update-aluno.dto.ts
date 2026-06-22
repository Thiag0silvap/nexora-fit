import { ObjetivoTreino } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAlunoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  altura?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pesoAtual?: number;

  @IsOptional()
  @IsEnum(ObjetivoTreino)
  objetivo?: ObjetivoTreino;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
