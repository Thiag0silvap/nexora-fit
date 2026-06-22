import { IsString, MinLength } from 'class-validator';

export class ReactivateAlunoDto {
  @IsString()
  @MinLength(6)
  senha: string;
}
