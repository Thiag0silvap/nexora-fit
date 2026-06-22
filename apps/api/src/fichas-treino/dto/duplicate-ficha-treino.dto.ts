import { IsOptional, IsString, MinLength } from 'class-validator';

export class DuplicateFichaTreinoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
