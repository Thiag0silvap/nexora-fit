import { Module } from '@nestjs/common';
import { ExecucoesController } from './execucoes.controller';
import { ExecucoesService } from './execucoes.service';

@Module({
  controllers: [ExecucoesController],
  providers: [ExecucoesService],
})
export class ExecucoesModule {}
