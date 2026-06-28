CREATE TABLE "AlunoExercicioEvolucao" (
  "id" UUID NOT NULL,
  "alunoId" UUID NOT NULL,
  "exercicioId" UUID NOT NULL,
  "ultimaCarga" DECIMAL(7, 2) NOT NULL,
  "melhorCarga" DECIMAL(7, 2) NOT NULL,
  "ultimaRepeticao" INTEGER,
  "melhorRepeticao" INTEGER,
  "ultimaExecucao" TIMESTAMP(3) NOT NULL,
  "melhorCargaExecutadaEm" TIMESTAMP(3) NOT NULL,
  "observacaoUltima" TEXT,
  "quantidadeExecucoes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AlunoExercicioEvolucao_pkey" PRIMARY KEY ("id")
);

WITH execucoes_base AS (
  SELECT
    et."alunoId",
    ed."exercicioId",
    et."carga",
    et."repeticoesRealizadas",
    et."observacao",
    et."executadoEm"
  FROM "ExecucaoTreino" et
  INNER JOIN "ExercicioDivisao" ed ON ed."id" = et."exercicioDivisaoId"
),
ultimas AS (
  SELECT DISTINCT ON ("alunoId", "exercicioId")
    "alunoId",
    "exercicioId",
    "carga" AS "ultimaCarga",
    "repeticoesRealizadas" AS "ultimaRepeticao",
    "executadoEm" AS "ultimaExecucao",
    "observacao" AS "observacaoUltima"
  FROM execucoes_base
  ORDER BY "alunoId", "exercicioId", "executadoEm" DESC
),
melhores AS (
  SELECT DISTINCT ON ("alunoId", "exercicioId")
    "alunoId",
    "exercicioId",
    "carga" AS "melhorCarga",
    "repeticoesRealizadas" AS "melhorRepeticao",
    "executadoEm" AS "melhorCargaExecutadaEm"
  FROM execucoes_base
  ORDER BY "alunoId", "exercicioId", "carga" DESC, "executadoEm" DESC
),
contagens AS (
  SELECT
    "alunoId",
    "exercicioId",
    COUNT(*)::INTEGER AS "quantidadeExecucoes"
  FROM execucoes_base
  GROUP BY "alunoId", "exercicioId"
)
INSERT INTO "AlunoExercicioEvolucao" (
  "id",
  "alunoId",
  "exercicioId",
  "ultimaCarga",
  "melhorCarga",
  "ultimaRepeticao",
  "melhorRepeticao",
  "ultimaExecucao",
  "melhorCargaExecutadaEm",
  "observacaoUltima",
  "quantidadeExecucoes",
  "updatedAt"
)
SELECT
  CONCAT(
    SUBSTRING(MD5(ultimas."alunoId"::TEXT || ultimas."exercicioId"::TEXT), 1, 8),
    '-',
    SUBSTRING(MD5(ultimas."alunoId"::TEXT || ultimas."exercicioId"::TEXT), 9, 4),
    '-',
    SUBSTRING(MD5(ultimas."alunoId"::TEXT || ultimas."exercicioId"::TEXT), 13, 4),
    '-',
    SUBSTRING(MD5(ultimas."alunoId"::TEXT || ultimas."exercicioId"::TEXT), 17, 4),
    '-',
    SUBSTRING(MD5(ultimas."alunoId"::TEXT || ultimas."exercicioId"::TEXT), 21, 12)
  )::UUID,
  ultimas."alunoId",
  ultimas."exercicioId",
  ultimas."ultimaCarga",
  melhores."melhorCarga",
  ultimas."ultimaRepeticao",
  melhores."melhorRepeticao",
  ultimas."ultimaExecucao",
  melhores."melhorCargaExecutadaEm",
  ultimas."observacaoUltima",
  contagens."quantidadeExecucoes",
  CURRENT_TIMESTAMP
FROM ultimas
INNER JOIN melhores
  ON melhores."alunoId" = ultimas."alunoId"
  AND melhores."exercicioId" = ultimas."exercicioId"
INNER JOIN contagens
  ON contagens."alunoId" = ultimas."alunoId"
  AND contagens."exercicioId" = ultimas."exercicioId";

CREATE UNIQUE INDEX "AlunoExercicioEvolucao_alunoId_exercicioId_key"
  ON "AlunoExercicioEvolucao"("alunoId", "exercicioId");

CREATE INDEX "AlunoExercicioEvolucao_alunoId_idx"
  ON "AlunoExercicioEvolucao"("alunoId");

CREATE INDEX "AlunoExercicioEvolucao_exercicioId_idx"
  ON "AlunoExercicioEvolucao"("exercicioId");

CREATE INDEX "AlunoExercicioEvolucao_ultimaExecucao_idx"
  ON "AlunoExercicioEvolucao"("ultimaExecucao");

ALTER TABLE "AlunoExercicioEvolucao"
  ADD CONSTRAINT "AlunoExercicioEvolucao_alunoId_fkey"
  FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AlunoExercicioEvolucao"
  ADD CONSTRAINT "AlunoExercicioEvolucao_exercicioId_fkey"
  FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
