import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  identificador?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @MinLength(6)
  senha: string;
}
