import { ObjetivoTreino, Sexo } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  matricula?: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  @IsEnum(Sexo)
  sexo?: Sexo;

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
}
