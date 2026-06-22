import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExecucaoDto {
  @IsUUID()
  exercicioDivisaoId: string;

  @IsNumber()
  @Min(0)
  carga: number;

  @IsInt()
  @Min(1)
  repeticoesRealizadas: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
