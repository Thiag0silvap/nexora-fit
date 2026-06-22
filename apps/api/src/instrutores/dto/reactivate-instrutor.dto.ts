import { IsString, MinLength } from 'class-validator';

export class ReactivateInstrutorDto {
  @IsString()
  @MinLength(6)
  senha: string;
}
