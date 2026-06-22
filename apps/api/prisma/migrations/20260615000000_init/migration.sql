-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN_ACADEMIA', 'INSTRUTOR', 'ALUNO', 'RECEPCAO');

-- CreateEnum
CREATE TYPE "ObjetivoTreino" AS ENUM ('HIPERTROFIA', 'EMAGRECIMENTO', 'CONDICIONAMENTO');

-- CreateEnum
CREATE TYPE "StatusFicha" AS ENUM ('ATIVA', 'INATIVA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "GrupoMuscular" AS ENUM ('PEITO', 'COSTAS', 'OMBRO', 'BICEPS', 'TRICEPS', 'PERNAS', 'GLUTEOS', 'ABDOMEN', 'CARDIO');

-- CreateTable
CREATE TABLE "Academia" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Academia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" UUID NOT NULL,
    "academiaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "matricula" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "sexo" "Sexo",
    "altura" DECIMAL(5,2),
    "pesoAtual" DECIMAL(5,2),
    "objetivo" "ObjetivoTreino",
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrutor" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "cref" TEXT,
    "especialidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "grupoMuscular" "GrupoMuscular" NOT NULL,
    "descricao" TEXT,
    "videoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaTreino" (
    "id" UUID NOT NULL,
    "alunoId" UUID NOT NULL,
    "instrutorId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "StatusFicha" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaTreino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DivisaoTreino" (
    "id" UUID NOT NULL,
    "fichaTreinoId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DivisaoTreino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExercicioDivisao" (
    "id" UUID NOT NULL,
    "divisaoTreinoId" UUID NOT NULL,
    "exercicioId" UUID NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" TEXT NOT NULL,
    "descansoSegundos" INTEGER,
    "observacao" TEXT,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExercicioDivisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoFisica" (
    "id" UUID NOT NULL,
    "alunoId" UUID NOT NULL,
    "peso" DECIMAL(5,2),
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoFisica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedidasCorporais" (
    "id" UUID NOT NULL,
    "avaliacaoFisicaId" UUID NOT NULL,
    "pescoco" DECIMAL(5,2),
    "ombro" DECIMAL(5,2),
    "peitoral" DECIMAL(5,2),
    "cintura" DECIMAL(5,2),
    "abdomen" DECIMAL(5,2),
    "quadril" DECIMAL(5,2),
    "bracoDireito" DECIMAL(5,2),
    "bracoEsquerdo" DECIMAL(5,2),
    "antebracoDireito" DECIMAL(5,2),
    "antebracoEsquerdo" DECIMAL(5,2),
    "coxaDireita" DECIMAL(5,2),
    "coxaEsquerda" DECIMAL(5,2),
    "panturrilhaDireita" DECIMAL(5,2),
    "panturrilhaEsquerda" DECIMAL(5,2),

    CONSTRAINT "MedidasCorporais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Academia_cnpj_key" ON "Academia"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Academia_email_key" ON "Academia"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_academiaId_idx" ON "Usuario"("academiaId");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "Usuario"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_usuarioId_key" ON "Aluno"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Instrutor_usuarioId_key" ON "Instrutor"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercicio_nome_key" ON "Exercicio"("nome");

-- CreateIndex
CREATE INDEX "Exercicio_grupoMuscular_idx" ON "Exercicio"("grupoMuscular");

-- CreateIndex
CREATE INDEX "FichaTreino_alunoId_idx" ON "FichaTreino"("alunoId");

-- CreateIndex
CREATE INDEX "FichaTreino_instrutorId_idx" ON "FichaTreino"("instrutorId");

-- CreateIndex
CREATE INDEX "FichaTreino_status_idx" ON "FichaTreino"("status");

-- CreateIndex
CREATE INDEX "DivisaoTreino_fichaTreinoId_idx" ON "DivisaoTreino"("fichaTreinoId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisaoTreino_fichaTreinoId_ordem_key" ON "DivisaoTreino"("fichaTreinoId", "ordem");

-- CreateIndex
CREATE INDEX "ExercicioDivisao_divisaoTreinoId_idx" ON "ExercicioDivisao"("divisaoTreinoId");

-- CreateIndex
CREATE INDEX "ExercicioDivisao_exercicioId_idx" ON "ExercicioDivisao"("exercicioId");

-- CreateIndex
CREATE UNIQUE INDEX "ExercicioDivisao_divisaoTreinoId_ordem_key" ON "ExercicioDivisao"("divisaoTreinoId", "ordem");

-- CreateIndex
CREATE INDEX "AvaliacaoFisica_alunoId_idx" ON "AvaliacaoFisica"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "MedidasCorporais_avaliacaoFisicaId_key" ON "MedidasCorporais"("avaliacaoFisicaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_academiaId_fkey" FOREIGN KEY ("academiaId") REFERENCES "Academia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrutor" ADD CONSTRAINT "Instrutor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaTreino" ADD CONSTRAINT "FichaTreino_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaTreino" ADD CONSTRAINT "FichaTreino_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES "Instrutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoTreino" ADD CONSTRAINT "DivisaoTreino_fichaTreinoId_fkey" FOREIGN KEY ("fichaTreinoId") REFERENCES "FichaTreino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercicioDivisao" ADD CONSTRAINT "ExercicioDivisao_divisaoTreinoId_fkey" FOREIGN KEY ("divisaoTreinoId") REFERENCES "DivisaoTreino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercicioDivisao" ADD CONSTRAINT "ExercicioDivisao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoFisica" ADD CONSTRAINT "AvaliacaoFisica_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedidasCorporais" ADD CONSTRAINT "MedidasCorporais_avaliacaoFisicaId_fkey" FOREIGN KEY ("avaliacaoFisicaId") REFERENCES "AvaliacaoFisica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
