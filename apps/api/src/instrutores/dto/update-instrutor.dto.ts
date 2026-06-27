import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateInstrutorDto {
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
  @IsString()
  @MinLength(1)
  cref?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  especialidade?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
