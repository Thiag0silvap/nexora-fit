import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateMedidasCorporaisDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  pescoco?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ombro?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peitoral?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cintura?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  abdomen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quadril?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bracoDireito?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bracoEsquerdo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  antebracoDireito?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  antebracoEsquerdo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coxaDireita?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coxaEsquerda?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  panturrilhaDireita?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  panturrilhaEsquerda?: number;
}

export class CreateAvaliacaoFisicaDto {
  @IsUUID()
  alunoId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso?: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMedidasCorporaisDto)
  medidas?: CreateMedidasCorporaisDto;
}
