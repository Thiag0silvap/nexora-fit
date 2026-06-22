-- CreateTable
CREATE TABLE "ExecucaoTreino" (
    "id" UUID NOT NULL,
    "alunoId" UUID NOT NULL,
    "exercicioDivisaoId" UUID NOT NULL,
    "carga" DECIMAL(7,2) NOT NULL,
    "repeticoesRealizadas" INTEGER NOT NULL,
    "observacao" TEXT,
    "executadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecucaoTreino_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecucaoTreino_alunoId_idx" ON "ExecucaoTreino"("alunoId");

-- CreateIndex
CREATE INDEX "ExecucaoTreino_exercicioDivisaoId_idx" ON "ExecucaoTreino"("exercicioDivisaoId");

-- CreateIndex
CREATE INDEX "ExecucaoTreino_executadoEm_idx" ON "ExecucaoTreino"("executadoEm");

-- AddForeignKey
ALTER TABLE "ExecucaoTreino" ADD CONSTRAINT "ExecucaoTreino_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecucaoTreino" ADD CONSTRAINT "ExecucaoTreino_exercicioDivisaoId_fkey" FOREIGN KEY ("exercicioDivisaoId") REFERENCES "ExercicioDivisao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
