import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { ActiveWorkout, StudentProfile } from '../types';

type StudentDashboardScreenProps = {
  profile: StudentProfile | null;
  workout: ActiveWorkout | null;
  loading: boolean;
  error?: string | null;
  completedExercises: Record<string, boolean>;
  onLogout: () => void;
  onOpenWorkout: () => void;
  onOpenEvolution: () => void;
  onOpenEvaluationHistory: () => void;
  onRefreshStudentData: () => Promise<void>;
};

export function StudentDashboardScreen({
  profile,
  workout,
  loading,
  error,
  completedExercises,
  onLogout,
  onOpenWorkout,
  onOpenEvolution,
  onOpenEvaluationHistory,
  onRefreshStudentData,
}: StudentDashboardScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  const alunoNome = profile?.usuario.nome ?? workout?.aluno.usuario.nome ?? 'Aluno';
  const primeiroNome = alunoNome.split(' ')[0] || 'Aluno';
  const todayDivision = workout?.divisoes[0] ?? null;
  const todayExercises = todayDivision?.exerciciosDivisao ?? [];
  const totalTodayExercises = todayExercises.length;
  const completedTodayCount = useMemo(
    () => todayExercises.filter((exercise) => completedExercises[exercise.id]).length,
    [completedExercises, todayExercises],
  );
  const progressPercent = calculatePercent(completedTodayCount, totalTodayExercises);
  const pesoAtual = toNumber(profile?.aluno.pesoAtual);
  const alturaMetros = normalizeHeightToMeters(profile?.aluno.altura);
  const imc = pesoAtual !== null && alturaMetros ? pesoAtual / (alturaMetros * alturaMetros) : null;
  const insights = buildHomeInsights({
    completedTodayCount,
    totalTodayExercises,
    workoutName: todayDivision?.nome ?? workout?.nome ?? null,
    objective: profile?.aluno.objetivo ?? null,
  });

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await onRefreshStudentData();
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
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Nexora Fit</Text>
            <Text style={styles.title}>Olá, {primeiroNome} 👋</Text>
            <Text style={styles.slogan}>Sua evolução, todos os dias.</Text>
          </View>
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Treino de hoje</Text>
              <Text numberOfLines={2} style={styles.heroTitle}>
                {todayDivision?.nome ?? workout?.nome ?? 'Ainda sem ficha ativa'}
              </Text>
              <Text style={styles.heroText}>
                {workout
                  ? `${completedTodayCount} de ${totalTodayExercises} exercícios`
                  : error ?? 'Quando sua ficha estiver liberada, ela aparece aqui.'}
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{progressPercent}%</Text>
            </View>
          </View>
          <ProgressBar height={10} progress={progressPercent} style={styles.progressBar} />
          <Pressable
            disabled={!workout}
            onPress={onOpenWorkout}
            style={({ pressed }) => [
              styles.primaryButton,
              !workout ? styles.primaryButtonDisabled : null,
              pressed && workout ? styles.buttonPressed : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {completedTodayCount > 0 ? 'Continuar treino' : 'Começar treino'}
            </Text>
          </Pressable>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seu progresso</Text>
          <Text style={styles.sectionHint}>O essencial, sem poluição.</Text>
        </View>

        <View style={styles.progressMiniGrid}>
          <MiniStat
            label="Hoje"
            value={`${completedTodayCount}/${totalTodayExercises || 0}`}
          />
          <MiniStat
            label="Mês"
            value={workout?.divisoes.length ? `${workout.divisoes.length}` : '0'}
          />
          <MiniStat
            label="Objetivo"
            value={formatObjective(profile?.aluno.objetivo)}
          />
        </View>

        <GlassCard style={styles.compactCard}>
          <View style={styles.cardTitleRow}>
            <View>
              <Text style={styles.cardKicker}>Insights</Text>
              <Text style={styles.cardTitle}>Sinais da semana</Text>
            </View>
          </View>
          {loading ? (
            <View style={styles.loadingStack}>
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonLineShort} />
            </View>
          ) : insights.length > 0 ? (
            <View style={styles.insightList}>
              {insights.map((insight, index) => (
                <View key={insight} style={styles.insightItem}>
                  <Text style={styles.insightIcon}>{['🔥', '🏆', '💪'][index] ?? '•'}</Text>
                  <Text numberOfLines={2} style={styles.insightText}>
                    {insight}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>Registre treinos e avaliações para gerar insights.</Text>
          )}
        </GlassCard>

        <View style={styles.shortcutGrid}>
          <ShortcutTile title="Ver treino" onPress={onOpenWorkout} disabled={!workout} />
          <ShortcutTile title="Evolução" onPress={onOpenEvolution} />
          <ShortcutTile title="Avaliações" onPress={onOpenEvaluationHistory} />
          <ShortcutTile title="Atualizar" onPress={handleRefresh} />
        </View>

        <GlassCard style={styles.compactCard}>
          <View style={styles.cardTitleRow}>
            <View>
              <Text style={styles.cardKicker}>Resumo físico</Text>
              <Text style={styles.cardTitle}>Últimos registros</Text>
            </View>
            <Pressable onPress={onOpenEvolution} style={styles.linkButton}>
              <Text style={styles.linkText}>Ver evolução</Text>
            </Pressable>
          </View>

          <View style={styles.physicalGrid}>
            <PhysicalMetric
              label="Peso"
              value={loading ? '...' : formatWeight(pesoAtual) ?? 'Sem dados'}
            />
            <PhysicalMetric
              label="IMC"
              value={loading ? '...' : formatNumber(imc) ?? 'Sem dados'}
            />
            <PhysicalMetric
              label="Última avaliação"
              value="Ver evolução"
            />
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard style={styles.miniStat}>
      <Text numberOfLines={1} style={styles.miniLabel}>
        {label}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.miniValue}>
        {value}
      </Text>
    </GlassCard>
  );
}

function ShortcutTile({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shortcutTile,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.shortcutDisabled : null,
      ]}
    >
      <Text style={styles.shortcutIcon}>›</Text>
      <Text style={styles.shortcutText}>{title}</Text>
    </Pressable>
  );
}

function PhysicalMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.physicalMetric}>
      <Text style={styles.physicalLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.physicalValue}>
        {value}
      </Text>
    </View>
  );
}

function calculatePercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function formatWeight(value?: number | string | null) {
  const numberValue = toNumber(value);
  if (numberValue === null) return null;
  return `${numberValue.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} kg`;
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return null;
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function formatObjective(value?: string | null) {
  if (!value) return 'Sem dados';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function normalizeHeightToMeters(value?: number | string | null) {
  const height = toNumber(value);
  if (!height) return null;
  return height > 3 ? height / 100 : height;
}

function buildHomeInsights(input: {
  completedTodayCount: number;
  totalTodayExercises: number;
  workoutName: string | null;
  objective: string | null;
}) {
  const insights: string[] = [];

  if (input.totalTodayExercises > 0) {
    insights.push(
      input.completedTodayCount > 0
        ? `Você já concluiu ${input.completedTodayCount} de ${input.totalTodayExercises} exercícios hoje.`
        : `Seu treino de hoje tem ${input.totalTodayExercises} exercícios planejados.`,
    );
  }

  if (input.workoutName) {
    insights.push(`O foco agora é ${input.workoutName}.`);
  }

  if (input.objective) {
    insights.push(`Objetivo atual: ${formatObjective(input.objective)}.`);
  }

  return insights.slice(0, 3);
}

function toNumber(value?: number | string | null) {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 220,
    bottom: 40,
    height: 300,
    left: -170,
    position: 'absolute',
    width: 300,
  },
  content: {
    padding: 18,
    paddingBottom: 34,
    paddingTop: 54,
  },
  topBar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  headerCopy: { flex: 1 },
  kicker: {
    color: '#B7FF4A',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
    marginTop: 4,
  },
  slogan: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  logoutText: { color: '#F4F7FF', fontSize: 12, fontWeight: '900' },
  heroCard: {
    marginTop: 18,
    padding: 17,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  heroCopy: { flex: 1 },
  heroLabel: {
    color: '#B7FF4A',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    marginTop: 7,
  },
  heroText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 7,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.34)',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  progressBadgeText: {
    color: '#D7FF8C',
    fontSize: 14,
    fontWeight: '900',
  },
  progressBar: { marginTop: 15 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 17,
    justifyContent: 'center',
    marginTop: 15,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  primaryButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.12)' },
  primaryButtonText: { color: '#07110B', fontSize: 14, fontWeight: '900' },
  buttonPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  sectionHeader: { marginTop: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  sectionHint: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 3 },
  progressMiniGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 11,
  },
  miniStat: {
    flex: 1,
    minHeight: 76,
    padding: 12,
  },
  miniLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  miniValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 9,
  },
  compactCard: {
    marginTop: 14,
    padding: 16,
  },
  cardTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardKicker: {
    color: '#B7FF4A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  mutedText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 12,
  },
  loadingStack: { gap: 10, marginTop: 14 },
  skeletonLine: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    height: 14,
    width: '86%',
  },
  skeletonLineShort: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 14,
    width: '58%',
  },
  insightList: { gap: 10, marginTop: 13 },
  insightItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  insightIcon: { fontSize: 15, lineHeight: 20 },
  insightText: {
    color: '#DDE6F5',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  shortcutTile: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 90,
    justifyContent: 'center',
    padding: 12,
    width: '48.4%',
  },
  shortcutDisabled: { opacity: 0.45 },
  shortcutIcon: {
    color: '#B7FF4A',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  shortcutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: 'rgba(183,255,74,0.13)',
    borderColor: 'rgba(183,255,74,0.28)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkText: { color: '#D7FF8C', fontSize: 11, fontWeight: '900' },
  physicalGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  physicalMetric: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 17,
    flex: 1,
    padding: 12,
  },
  physicalLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  physicalValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
  },
});
