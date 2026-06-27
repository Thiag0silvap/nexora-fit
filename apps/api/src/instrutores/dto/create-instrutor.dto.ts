import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateInstrutorDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9._-]+$/)
  username: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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
