import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateInstrutorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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
