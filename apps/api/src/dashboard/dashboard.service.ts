import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';

type ChartPoint = {
  label: string;
  date: string;
  value: number;
};

type ExerciseStats = {
  id: string;
  nome: string;
  grupoMuscular: string;
  quantidade: number;
  maiorCarga: number;
  primeiraCarga: number;
  ultimaCarga: number;
  evolucao: number;
  historico: ChartPoint[];
};

const measureConfig = [
  { key: 'bracoDireito', label: 'Braço' },
  { key: 'peitoral', label: 'Peitoral' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'abdomen', label: 'Abdômen' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'coxaDireita', label: 'Coxa' },
  { key: 'panturrilhaDireita', label: 'Panturrilha' },
] as const;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvolucao(user: AuthUser) {
    const aluno = await this.prisma.aluno.findFirst({
      where: {
        usuarioId: user.id,
        ativo: true,
        usuario: {
          academiaId: user.academiaId,
          ativo: true,
        },
      },
      select: {
        id: true,
        altura: true,
        pesoAtual: true,
        sexo: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException('Perfil de aluno não encontrado.');
    }

    const [avaliacoes, execucoes, evolucoes] = await Promise.all([
      this.prisma.avaliacaoFisica.findMany({
        where: { alunoId: aluno.id },
        orderBy: { createdAt: 'asc' },
        include: { medidasCorporais: true },
      }),
      this.prisma.execucaoTreino.findMany({
        where: { alunoId: aluno.id },
        orderBy: { executadoEm: 'asc' },
        include: {
          exercicioDivisao: {
            include: {
              exercicio: true,
              divisaoTreino: {
                select: {
                  nome: true,
                  fichaTreino: { select: { nome: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.alunoExercicioEvolucao.findMany({
        where: { alunoId: aluno.id },
        include: { exercicio: true },
      }),
    ]);

    const pesoInicial = this.toNumber(avaliacoes[0]?.peso);
    const pesoUltimaAvaliacao = this.toNumber(avaliacoes.at(-1)?.peso);
    const pesoAtual = pesoUltimaAvaliacao ?? this.toNumber(aluno.pesoAtual);
    const diferencaPeso =
      pesoAtual !== null && pesoInicial !== null ? pesoAtual - pesoInicial : null;
    const percentualPeso =
      diferencaPeso !== null && pesoInicial && pesoInicial > 0
        ? (diferencaPeso / pesoInicial) * 100
        : null;
    const alturaMetros = this.normalizeHeightToMeters(aluno.altura);
    const ultimaAvaliacao = avaliacoes.at(-1);
    const medidasAtuais = ultimaAvaliacao?.medidasCorporais;
    const imc =
      pesoAtual !== null && alturaMetros ? pesoAtual / (alturaMetros * alturaMetros) : null;
    const percentualGordura = this.estimateBodyFat({
      sexo: aluno.sexo,
      alturaCm: alturaMetros ? alturaMetros * 100 : null,
      pescoco: this.toNumber(medidasAtuais?.pescoco),
      cintura: this.toNumber(medidasAtuais?.cintura),
      abdomen: this.toNumber(medidasAtuais?.abdomen),
      quadril: this.toNumber(medidasAtuais?.quadril),
    });
    const massaMagra =
      pesoAtual !== null && percentualGordura !== null
        ? pesoAtual * (1 - percentualGordura / 100)
        : null;

    const pesoChart = avaliacoes
      .map((avaliacao) => ({
        label: this.formatShortDate(avaliacao.createdAt),
        date: avaliacao.createdAt.toISOString(),
        value: this.toNumber(avaliacao.peso),
      }))
      .filter((point): point is ChartPoint => point.value !== null);

    const medidasChart = Object.fromEntries(
      measureConfig.map((measure) => [
        measure.key,
        {
          label: measure.label,
          points: avaliacoes
            .map((avaliacao) => ({
              label: this.formatShortDate(avaliacao.createdAt),
              date: avaliacao.createdAt.toISOString(),
              value: this.toNumber(avaliacao.medidasCorporais?.[measure.key]),
            }))
            .filter((point): point is ChartPoint => point.value !== null),
        },
      ]),
    );

    const exerciseStats = this.buildExerciseStats(execucoes);
    const cargaChart = exerciseStats.map((exercise) => ({
      exercicioId: exercise.id,
      nome: exercise.nome,
      grupoMuscular: exercise.grupoMuscular,
      points: exercise.historico,
    }));

    const maiorCarga = evolucoes.reduce<null | {
      exercicio: string;
      carga: number;
      data: string;
    }>((record, evolucao) => {
      const carga = this.toNumber(evolucao.melhorCarga) ?? 0;
      if (!record || carga > record.carga) {
        return {
          exercicio: evolucao.exercicio.nome,
          carga,
          data: evolucao.melhorCargaExecutadaEm.toISOString(),
        };
      }
      return record;
    }, null);
    const maiorEvolucao = exerciseStats.reduce<null | {
      exercicio: string;
      diferenca: number;
    }>((record, exercise) => {
      if (!record || exercise.evolucao > record.diferenca) {
        return { exercicio: exercise.nome, diferenca: exercise.evolucao };
      }
      return record;
    }, null);
    const exercicioMaisExecutado = exerciseStats.reduce<null | ExerciseStats>(
      (record, exercise) => (!record || exercise.quantidade > record.quantidade ? exercise : record),
      null,
    );

    const workoutDays = this.getWorkoutDays(execucoes);
    const treinosMes = this.countDaysInCurrentMonth(workoutDays);
    const treinosAno = this.countDaysInCurrentYear(workoutDays);
    const sequencias = this.calculateStreaks(workoutDays);
    const consistencia = this.resolveConsistency(treinosMes);

    const insights = this.buildInsights({
      treinosMes,
      diferencaPeso,
      exercicioMaisExecutado,
      maiorEvolucao,
    });

    return {
      resumoPeso: {
        pesoAtual,
        pesoInicial,
        diferenca: diferencaPeso,
        percentual: percentualPeso,
      },
      resumoCorporal: {
        imc,
        percentualGordura,
        massaMagra,
        circunferenciaAbdominal:
          this.toNumber(medidasAtuais?.abdomen) ?? this.toNumber(medidasAtuais?.cintura),
      },
      graficos: {
        peso: pesoChart,
        medidas: medidasChart,
        cargas: cargaChart,
      },
      recordes: {
        maiorCarga,
        maiorEvolucao,
        exercicioFavorito: exercicioMaisExecutado
          ? {
              exercicio: exercicioMaisExecutado.nome,
              quantidade: exercicioMaisExecutado.quantidade,
            }
          : null,
        exercicioMaisExecutado: exercicioMaisExecutado
          ? {
              exercicio: exercicioMaisExecutado.nome,
              quantidade: exercicioMaisExecutado.quantidade,
            }
          : null,
      },
      treinos: {
        esteMes: treinosMes,
        esteAno: treinosAno,
        diasConsecutivos: sequencias.current,
        maiorSequencia: sequencias.max,
      },
      consistencia,
      insights,
      metadata: {
        geradoEm: new Date().toISOString(),
        totalAvaliacoes: avaliacoes.length,
        totalExecucoes: execucoes.length,
        totalExercicios: exerciseStats.length,
      },
    };
  }

  private buildExerciseStats(
    execucoes: Array<
      Prisma.ExecucaoTreinoGetPayload<{
        include: {
          exercicioDivisao: {
            include: {
              exercicio: true;
              divisaoTreino: {
                select: {
                  nome: true;
                  fichaTreino: { select: { nome: true } };
                };
              };
            };
          };
        };
      }>
    >,
  ) {
    const stats = new Map<string, ExerciseStats>();

    execucoes.forEach((execucao) => {
      const exercicio = execucao.exercicioDivisao.exercicio;
      const carga = this.toNumber(execucao.carga) ?? 0;
      const current = stats.get(exercicio.id);
      const point = {
        label: this.formatShortDate(execucao.executadoEm),
        date: execucao.executadoEm.toISOString(),
        value: carga,
      };

      if (!current) {
        stats.set(exercicio.id, {
          id: exercicio.id,
          nome: exercicio.nome,
          grupoMuscular: exercicio.grupoMuscular,
          quantidade: 1,
          maiorCarga: carga,
          primeiraCarga: carga,
          ultimaCarga: carga,
          evolucao: 0,
          historico: [point],
        });
        return;
      }

      current.quantidade += 1;
      current.maiorCarga = Math.max(current.maiorCarga, carga);
      current.ultimaCarga = carga;
      current.evolucao = current.ultimaCarga - current.primeiraCarga;
      current.historico.push(point);
    });

    return [...stats.values()].sort((first, second) =>
      first.nome.localeCompare(second.nome),
    );
  }

  private buildInsights(input: {
    treinosMes: number;
    diferencaPeso: number | null;
    exercicioMaisExecutado: ExerciseStats | null;
    maiorEvolucao: { exercicio: string; diferenca: number } | null;
  }) {
    const insights = [`Você treinou ${input.treinosMes} vez${input.treinosMes === 1 ? '' : 'es'} este mês.`];

    if (input.diferencaPeso !== null) {
      const abs = Math.abs(input.diferencaPeso).toLocaleString('pt-BR', {
        maximumFractionDigits: 1,
      });
      insights.push(
        input.diferencaPeso < 0
          ? `Seu peso reduziu ${abs}kg desde a primeira avaliação.`
          : input.diferencaPeso > 0
            ? `Seu peso aumentou ${abs}kg desde a primeira avaliação.`
            : 'Seu peso permaneceu estável desde a primeira avaliação.',
      );
    }

    if (input.exercicioMaisExecutado) {
      insights.push(
        `Seu exercício mais realizado foi ${input.exercicioMaisExecutado.nome}.`,
      );
    }

    if (input.maiorEvolucao && input.maiorEvolucao.diferenca > 0) {
      insights.push(`Sua maior evolução foi em ${input.maiorEvolucao.exercicio}.`);
    }

    return insights;
  }

  private getWorkoutDays(
    execucoes: Array<{ executadoEm: Date }>,
  ) {
    return [...new Set(execucoes.map((execucao) => this.dateKey(execucao.executadoEm)))]
      .sort();
  }

  private countDaysInCurrentMonth(days: string[]) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return days.filter((day) => day.startsWith(month)).length;
  }

  private countDaysInCurrentYear(days: string[]) {
    const year = String(new Date().getFullYear());
    return days.filter((day) => day.startsWith(year)).length;
  }

  private calculateStreaks(days: string[]) {
    if (days.length === 0) {
      return { current: 0, max: 0 };
    }

    let max = 1;
    let currentRun = 1;

    for (let index = 1; index < days.length; index += 1) {
      const previous = new Date(`${days[index - 1]}T00:00:00.000Z`);
      const current = new Date(`${days[index]}T00:00:00.000Z`);
      const diffDays = (current.getTime() - previous.getTime()) / 86400000;

      if (diffDays === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }

      max = Math.max(max, currentRun);
    }

    const today = this.dateKey(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = this.dateKey(yesterdayDate);
    const lastDay = days.at(-1);
    const current = lastDay === today || lastDay === yesterday ? currentRun : 0;

    return { current, max };
  }

  private resolveConsistency(treinosMes: number) {
    if (treinosMes >= 16) return { nivel: 'Excelente', score: 100 };
    if (treinosMes >= 12) return { nivel: 'Muito boa', score: 78 };
    if (treinosMes >= 6) return { nivel: 'Boa', score: 52 };
    return { nivel: 'Baixa', score: Math.min(35, treinosMes * 6) };
  }

  private estimateBodyFat(input: {
    sexo: string | null;
    alturaCm: number | null;
    pescoco: number | null;
    cintura: number | null;
    abdomen: number | null;
    quadril: number | null;
  }) {
    if (!input.alturaCm || !input.pescoco) {
      return null;
    }

    if (input.sexo === 'MASCULINO' && input.abdomen && input.abdomen > input.pescoco) {
      return (
        86.01 * Math.log10(input.abdomen - input.pescoco) -
        70.041 * Math.log10(input.alturaCm) +
        36.76
      );
    }

    if (
      input.sexo === 'FEMININO' &&
      input.cintura &&
      input.quadril &&
      input.cintura + input.quadril > input.pescoco
    ) {
      return (
        163.205 * Math.log10(input.cintura + input.quadril - input.pescoco) -
        97.684 * Math.log10(input.alturaCm) -
        78.387
      );
    }

    return null;
  }

  private normalizeHeightToMeters(value?: Prisma.Decimal | null) {
    const height = this.toNumber(value);
    if (!height) return null;
    return height > 3 ? height / 100 : height;
  }

  private toNumber(value?: Prisma.Decimal | number | string | null) {
    if (value === undefined || value === null || value === '') return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private formatShortDate(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }

  private dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
