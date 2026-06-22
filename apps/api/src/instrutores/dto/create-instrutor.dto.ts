import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateInstrutorDto {
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
  cref?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  especialidade?: string;
}
