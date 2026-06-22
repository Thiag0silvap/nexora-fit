import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateDivisaoTreinoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsInt()
  @Min(1)
  ordem: number;
}
