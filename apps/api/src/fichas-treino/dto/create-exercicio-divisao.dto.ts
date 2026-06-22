import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateExercicioDivisaoDto {
  @IsUUID()
  exercicioId: string;

  @IsInt()
  @Min(1)
  series: number;

  @IsString()
  @MinLength(1)
  repeticoes: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  descansoSegundos?: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsInt()
  @Min(1)
  ordem: number;
}
