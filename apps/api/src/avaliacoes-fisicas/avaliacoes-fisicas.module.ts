import { Module } from '@nestjs/common';
import { AvaliacoesFisicasController } from './avaliacoes-fisicas.controller';
import { AvaliacoesFisicasService } from './avaliacoes-fisicas.service';

@Module({
  controllers: [AvaliacoesFisicasController],
  providers: [AvaliacoesFisicasService],
})
export class AvaliacoesFisicasModule {}
