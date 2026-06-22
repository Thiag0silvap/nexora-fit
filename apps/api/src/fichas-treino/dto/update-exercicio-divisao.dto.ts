import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateExercicioDivisaoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  series?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  repeticoes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  descansoSegundos?: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ordem?: number;
}
