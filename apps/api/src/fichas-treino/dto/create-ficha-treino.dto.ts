import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateFichaTreinoDto {
  @IsUUID()
  alunoId: string;

  @IsUUID()
  instrutorId: string;

  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
