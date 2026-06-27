import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { DashboardShortcutCard } from '../components/DashboardShortcutCard';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import {
  getExecucoesMe,
  getUltimaAvaliacaoFisicaByAluno,
} from '../services/api';
import {
  ActiveWorkout,
  ExecutionRecord,
  PhysicalEvaluation,
  StudentProfile,
} from '../types';

type StudentDashboardScreenProps = {
  profile: StudentProfile | null;
  workout: ActiveWorkout | null;
  token: string;
  loading: boolean;
  error?: string | null;
  completedExercises: Record<string, boolean>;
  onLogout: () => void;
  onOpenWorkout: () => void;
  onOpenEvaluationHistory: () => void;
  onRefreshStudentData: () => Promise<void>;
};

export function StudentDashboardScreen({
  profile,
  workout,
  token,
  loading,
  error,
  completedExercises,
  onLogout,
  onOpenWorkout,
  onOpenEvaluationHistory,
  onRefreshStudentData,
}: StudentDashboardScreenProps) {
  const [latestEvaluation, setLatestEvaluation] = useState<PhysicalEvaluation | null>(null);
  const [monthlyWorkoutCount, setMonthlyWorkoutCount] = useState<number | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const alunoId = profile?.aluno.id;
  const alunoNome = profile?.usuario.nome ?? workout?.aluno.usuario.nome ?? 'Aluno';
  const primeiroNome = alunoNome.split(' ')[0] || 'Aluno';
  const totalExercises = useMemo(
    () =>
      workout?.divisoes.reduce(
        (total, division) => total + division.exerciciosDivisao.length,
        0,
      ) ?? 0,
    [workout],
  );
  const completedCount = useMemo(
    () =>
      workout?.divisoes.reduce(
        (total, division) =>
          total +
          division.exerciciosDivisao.filter((exercise) => completedExercises[exercise.id])
            .length,
        0,
      ) ?? 0,
    [completedExercises, workout],
  );
  const progressPercent = calculatePercent(completedCount, totalExercises);

  const loadSummary = useCallback(async () => {
    if (!alunoId) {
      setLatestEvaluation(null);
      setMonthlyWorkoutCount(null);
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const [latestEvaluationData, executions] = await Promise.all([
        getUltimaAvaliacaoFisicaByAluno(token, alunoId),
        getExecucoesMe(token),
      ]);

      setLatestEvaluation(latestEvaluationData);
      setMonthlyWorkoutCount(countWorkoutDaysThisMonth(executions));
    } catch (loadError) {
      setSummaryError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar o resumo de evolução.',
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [alunoId, token]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await Promise.all([onRefreshStudentData(), loadSummary()]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={['#B7FF4A']}
            onRefresh={handleRefresh}
            progressBackgroundColor="#101528"
            refreshing={refreshing}
            tintColor="#B7FF4A"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>Nexora Fit</Text>
            <Text style={styles.title}>Olá, {primeiroNome}</Text>
          </View>
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <Text style={styles.slogan}>Sua evolução, todos os dias.</Text>

        {loading ? (
          <GlassCard style={styles.stateCard}>
            <ActivityIndicator color="#B7FF4A" />
            <Text style={styles.stateTitle}>Carregando seu painel</Text>
            <Text style={styles.stateText}>Buscando treino, perfil e evolução.</Text>
          </GlassCard>
        ) : null}

        {!loading && error && !profile ? (
          <GlassCard style={styles.stateCard}>
            <View style={styles.stateDot} />
            <Text style={styles.stateTitle}>Não foi possível carregar seu perfil</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={handleRefresh} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Atualizar dados</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Treino atual</Text>
              <Text numberOfLines={2} style={styles.heroTitle}>
                {workout?.nome ?? 'Ainda sem ficha ativa'}
              </Text>
              <Text numberOfLines={2} style={styles.heroText}>
                {workout
                  ? `${completedCount} de ${totalExercises} exercícios concluídos hoje`
                  : 'Quando seu instrutor liberar uma ficha, ela aparecerá aqui.'}
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>{progressPercent}%</Text>
            </View>
          </View>

          <ProgressBar progress={progressPercent} height={10} style={styles.heroProgress} />

          <Pressable
            disabled={!workout}
            onPress={onOpenWorkout}
            style={({ pressed }) => [
              styles.primaryButton,
              !workout ? styles.primaryButtonDisabled : null,
              pressed && workout ? styles.primaryButtonPressed : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>Ver treino</Text>
          </Pressable>
        </GlassCard>

        <View style={styles.metricsGrid}>
          <DashboardMetricCard
            detail={profile?.aluno.objetivo ? formatEnum(profile.aluno.objetivo) : undefined}
            label="Peso atual"
            tone="green"
            value={formatWeight(profile?.aluno.pesoAtual) ?? 'Ainda sem registro'}
          />
          <DashboardMetricCard
            detail={latestEvaluation?.observacao ?? undefined}
            label="Última avaliação"
            tone="purple"
            value={formatDate(latestEvaluation?.createdAt) ?? 'Ainda sem registro'}
          />
        </View>

        <View style={styles.metricsGrid}>
          <DashboardMetricCard
            detail={workout?.instrutor.usuario.nome ?? undefined}
            label="Ficha ativa"
            value={workout?.nome ?? 'Ainda sem registro'}
          />
          <DashboardMetricCard
            detail={summaryLoading ? 'Atualizando resumo' : summaryError ?? undefined}
            label="Treinos no mês"
            tone="green"
            value={
              monthlyWorkoutCount === null
                ? 'Ainda sem registro'
                : `${monthlyWorkoutCount} dia${monthlyWorkoutCount === 1 ? '' : 's'}`
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atalhos</Text>
          <Text style={styles.sectionHint}>Acesso rápido para o dia a dia</Text>
        </View>

        <View style={styles.shortcuts}>
          <DashboardShortcutCard
            description="Abrir sua ficha, registrar carga e usar o descanso."
            disabled={!workout}
            onPress={onOpenWorkout}
            title="Ver treino"
          />
          <DashboardShortcutCard
            description="Comparar peso e medidas registradas pelo instrutor."
            onPress={onOpenEvaluationHistory}
            title="Histórico de avaliações"
          />
          <DashboardShortcutCard
            description="Sincronizar treino, perfil e evolução agora."
            onPress={handleRefresh}
            title="Atualizar dados"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function countWorkoutDaysThisMonth(executions: ExecutionRecord[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const days = new Set<string>();

  executions.forEach((execution) => {
    const executionDate = new Date(execution.executadoEm);

    if (
      executionDate.getMonth() === currentMonth &&
      executionDate.getFullYear() === currentYear
    ) {
      days.add(executionDate.toISOString().slice(0, 10));
    }
  });

  return days.size;
}

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function formatWeight(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `${value} kg`;
  }

  return `${numericValue.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} kg`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowTop: {
    backgroundColor: 'rgba(183,255,74,0.16)',
    borderRadius: 180,
    height: 260,
    position: 'absolute',
    right: -130,
    top: -90,
    width: 260,
  },
  glowBottom: {
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderRadius: 220,
    bottom: 40,
    height: 300,
    left: -170,
    position: 'absolute',
    width: 300,
  },
  content: {
    padding: 20,
    paddingBottom: 42,
    paddingTop: 56,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#B7FF4A',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  slogan: {
    color: '#A8B3C4',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  stateCard: {
    alignItems: 'center',
    marginTop: 20,
    padding: 22,
  },
  stateDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  stateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  stateText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  heroCard: {
    marginTop: 22,
    padding: 18,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    color: '#B7FF4A',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 8,
  },
  heroText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
  },
  progressCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.34)',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  progressCircleText: {
    color: '#D7FF8C',
    fontSize: 16,
    fontWeight: '900',
  },
  heroProgress: {
    marginTop: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  primaryButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#07110B',
    fontSize: 14,
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sectionHeader: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  shortcuts: {
    gap: 12,
    marginTop: 14,
  },
});
