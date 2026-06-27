import { ObjetivoTreino } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAlunoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9._-]+$/)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

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
