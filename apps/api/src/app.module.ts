import { Module } from '@nestjs/common';
import { AcademiasModule } from './academias/academias.module';
import { AlunosModule } from './alunos/alunos.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvaliacoesFisicasModule } from './avaliacoes-fisicas/avaliacoes-fisicas.module';
import { ExerciciosModule } from './exercicios/exercicios.module';
import { ExecucoesModule } from './execucoes/execucoes.module';
import { FichasTreinoModule } from './fichas-treino/fichas-treino.module';
import { InstrutoresModule } from './instrutores/instrutores.module';
import { MobileModule } from './mobile/mobile.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AvaliacoesFisicasModule,
    AcademiasModule,
    AlunosModule,
    InstrutoresModule,
    FichasTreinoModule,
    ExecucoesModule,
    MobileModule,
    UsuariosModule,
    ExerciciosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
