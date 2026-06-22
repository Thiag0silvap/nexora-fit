import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateDivisaoTreinoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ordem?: number;
}
