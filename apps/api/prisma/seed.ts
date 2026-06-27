import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  GrupoMuscular,
  ObjetivoTreino,
  PrismaClient,
  Sexo,
  StatusFicha,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the Prisma seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  const academia = await prisma.academia.upsert({
    where: { email: 'demo@fitgestao.com' },
    update: {},
    create: {
      nome: 'Nexora Fit Academia Demo',
      email: 'demo@fitgestao.com',
      telefone: '(00) 00000-0000',
      ativa: true,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@fitgestao.com' },
    update: {
      nome: 'Admin',
      username: 'admin',
      senhaHash,
      role: UserRole.ADMIN_ACADEMIA,
      ativo: true,
    },
    create: {
      academiaId: academia.id,
      nome: 'Admin',
      username: 'admin',
      email: 'admin@fitgestao.com',
      senhaHash,
      role: UserRole.ADMIN_ACADEMIA,
      ativo: true,
    },
  });

  const instrutorUsuario = await prisma.usuario.upsert({
    where: { email: 'instrutor@fitgestao.com' },
    update: {
      nome: 'Instrutor Demo',
      username: 'instrutor.demo',
      senhaHash,
      role: UserRole.INSTRUTOR,
      ativo: true,
    },
    create: {
      academiaId: academia.id,
      nome: 'Instrutor Demo',
      username: 'instrutor.demo',
      email: 'instrutor@fitgestao.com',
      senhaHash,
      role: UserRole.INSTRUTOR,
      ativo: true,
    },
  });

  await prisma.instrutor.upsert({
    where: { usuarioId: instrutorUsuario.id },
    update: {},
    create: {
      usuarioId: instrutorUsuario.id,
      especialidade: 'Musculacao',
      ativo: true,
    },
  });

  const exercicios = [
    { nome: 'Peck Deck', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Peck Deck Fly', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Supino Reto', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Supino Inclinado', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Supino Declinado', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Supino Sentado', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Crossover', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Crucifixo', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Pull Over', grupoMuscular: GrupoMuscular.PEITO },
    { nome: 'Puxador Frontal', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Remada Banco Inclinado', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Remada Curvada', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Remada Sentada', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Remada Unilateral', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Remada Cavalinho', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Crucifixo Invertido', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Extensão de Ombro', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Barra Fixa', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Graviton', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Face Pull', grupoMuscular: GrupoMuscular.COSTAS },
    { nome: 'Desenvolvimento Barra', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Elevação Lateral', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Elevação Frontal', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Ombro Máquina', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Elevação Escapular', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Encolhimento de Ombros', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Remada Alta', grupoMuscular: GrupoMuscular.OMBRO },
    { nome: 'Rosca Direta', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Rosca Martelo', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Rosca Scott', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Rosca Alternada', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Rosca Concentrada', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Rosca Inversa', grupoMuscular: GrupoMuscular.BICEPS },
    { nome: 'Tríceps Pronado', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Supinado', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Francês', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Testa', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Corda', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Mergulho', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Tríceps Coice', grupoMuscular: GrupoMuscular.TRICEPS },
    { nome: 'Extensora', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Agachamento', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Hack', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Hack Squat Articulado', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Leg Press Horizontal', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Leg Articulado', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Adução', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Avanço', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Afundo', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Passada', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Step Up', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Sissy Squat', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Flexora em Pé', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Flexora Sentada', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Flexora Horizontal', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Stiff', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Banco Romano', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Extensão do Quadril', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Elevação Pélvica', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Quatro Apoios', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Sumô', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Recuo', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Búlgaro', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Abdução', grupoMuscular: GrupoMuscular.GLUTEOS },
    { nome: 'Panturrilha em Pé', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Panturrilha Sentada', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Flexão Tibial', grupoMuscular: GrupoMuscular.PERNAS },
    { nome: 'Abdominal Tradicional', grupoMuscular: GrupoMuscular.ABDOMEN },
    { nome: 'Abdominal Infra', grupoMuscular: GrupoMuscular.ABDOMEN },
    { nome: 'Abdominal Oblíquo', grupoMuscular: GrupoMuscular.ABDOMEN },
    { nome: 'Prancha', grupoMuscular: GrupoMuscular.ABDOMEN },
    { nome: 'Elevação de Pernas', grupoMuscular: GrupoMuscular.ABDOMEN },
    { nome: 'Esteira', grupoMuscular: GrupoMuscular.CARDIO },
    { nome: 'Bicicleta', grupoMuscular: GrupoMuscular.CARDIO },
    { nome: 'Elíptico', grupoMuscular: GrupoMuscular.CARDIO },
    { nome: 'Escada', grupoMuscular: GrupoMuscular.CARDIO },
  ];

  for (const exercicio of exercicios) {
    await prisma.exercicio.upsert({
      where: { nome: exercicio.nome },
      update: {
        grupoMuscular: exercicio.grupoMuscular,
        ativo: true,
      },
      create: {
        ...exercicio,
        ativo: true,
      },
    });
  }

  const alunoUsuario = await prisma.usuario.upsert({
    where: { email: 'mobile.aluno.1782014327117@fitgestao.com' },
    update: {
      academiaId: academia.id,
      nome: 'Aluno Mobile Teste',
      username: 'aluno.mobile',
      senhaHash,
      role: UserRole.ALUNO,
      ativo: true,
    },
    create: {
      academiaId: academia.id,
      nome: 'Aluno Mobile Teste',
      username: 'aluno.mobile',
      email: 'mobile.aluno.1782014327117@fitgestao.com',
      senhaHash,
      role: UserRole.ALUNO,
      ativo: true,
    },
  });

  const aluno = await prisma.aluno.upsert({
    where: { usuarioId: alunoUsuario.id },
    update: {
      matricula: 'MOBILE-DEMO-001',
      dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
      sexo: Sexo.MASCULINO,
      altura: '1.75',
      pesoAtual: '82.50',
      objetivo: ObjetivoTreino.HIPERTROFIA,
      ativo: true,
    },
    create: {
      usuarioId: alunoUsuario.id,
      matricula: 'MOBILE-DEMO-001',
      dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
      sexo: Sexo.MASCULINO,
      altura: '1.75',
      pesoAtual: '82.50',
      objetivo: ObjetivoTreino.HIPERTROFIA,
      ativo: true,
    },
  });

  const instrutor = await prisma.instrutor.findUniqueOrThrow({
    where: { usuarioId: instrutorUsuario.id },
  });

  const fichaExistente = await prisma.fichaTreino.findFirst({
    where: {
      alunoId: aluno.id,
      nome: 'Ficha Demo Completa',
    },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.fichaTreino.updateMany({
    where: {
      alunoId: aluno.id,
      status: StatusFicha.ATIVA,
      ...(fichaExistente ? { id: { not: fichaExistente.id } } : {}),
    },
    data: { status: StatusFicha.ARQUIVADA },
  });

  const ficha = fichaExistente
    ? await prisma.fichaTreino.update({
        where: { id: fichaExistente.id },
        data: {
          instrutorId: instrutor.id,
          nome: 'Ficha Demo Completa',
          observacao: 'Ficha completa para testes do aplicativo mobile.',
          status: StatusFicha.ATIVA,
        },
      })
    : await prisma.fichaTreino.create({
        data: {
          alunoId: aluno.id,
          instrutorId: instrutor.id,
          nome: 'Ficha Demo Completa',
          observacao: 'Ficha completa para testes do aplicativo mobile.',
          status: StatusFicha.ATIVA,
        },
      });

  const planoDemo = [
    {
      nome: 'Treino A - Peito, Ombro e Tríceps',
      ordem: 1,
      exercicios: [
        { nome: 'Supino Reto', series: 4, repeticoes: '8-10', descansoSegundos: 90 },
        { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descansoSegundos: 75 },
        { nome: 'Peck Deck', series: 3, repeticoes: '12', descansoSegundos: 60 },
        { nome: 'Tríceps Corda', series: 3, repeticoes: '12-15', descansoSegundos: 60 },
      ],
    },
    {
      nome: 'Treino B - Costas e Bíceps',
      ordem: 2,
      exercicios: [
        { nome: 'Rosca Direta', series: 4, repeticoes: '10-12', descansoSegundos: 60 },
      ],
    },
    {
      nome: 'Treino C - Pernas',
      ordem: 3,
      exercicios: [
        { nome: 'Agachamento', series: 4, repeticoes: '8-10', descansoSegundos: 120 },
        { nome: 'Leg Press Horizontal', series: 4, repeticoes: '10-12', descansoSegundos: 90 },
        { nome: 'Extensora', series: 3, repeticoes: '12-15', descansoSegundos: 60 },
      ],
    },
    {
      nome: 'Treino D - Cardio e Abdômen',
      ordem: 4,
      exercicios: [
        { nome: 'Abdominal Tradicional', series: 3, repeticoes: '15-20', descansoSegundos: 45 },
        { nome: 'Esteira', series: 1, repeticoes: '20 min', descansoSegundos: null },
      ],
    },
  ];

  for (const divisaoPlanejada of planoDemo) {
    const divisao = await prisma.divisaoTreino.upsert({
      where: {
        fichaTreinoId_ordem: {
          fichaTreinoId: ficha.id,
          ordem: divisaoPlanejada.ordem,
        },
      },
      update: {
        nome: divisaoPlanejada.nome,
      },
      create: {
        fichaTreinoId: ficha.id,
        nome: divisaoPlanejada.nome,
        ordem: divisaoPlanejada.ordem,
      },
    });

    for (const [index, exercicioPlanejado] of divisaoPlanejada.exercicios.entries()) {
      const exercicio = await prisma.exercicio.findUniqueOrThrow({
        where: { nome: exercicioPlanejado.nome },
      });

      await prisma.exercicioDivisao.upsert({
        where: {
          divisaoTreinoId_ordem: {
            divisaoTreinoId: divisao.id,
            ordem: index + 1,
          },
        },
        update: {
          exercicioId: exercicio.id,
          series: exercicioPlanejado.series,
          repeticoes: exercicioPlanejado.repeticoes,
          descansoSegundos: exercicioPlanejado.descansoSegundos,
          observacao: null,
        },
        create: {
          divisaoTreinoId: divisao.id,
          exercicioId: exercicio.id,
          series: exercicioPlanejado.series,
          repeticoes: exercicioPlanejado.repeticoes,
          descansoSegundos: exercicioPlanejado.descansoSegundos,
          observacao: null,
          ordem: index + 1,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
