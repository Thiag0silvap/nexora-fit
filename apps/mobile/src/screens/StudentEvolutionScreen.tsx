import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EvolutionLineChart } from '../components/EvolutionLineChart';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { getDashboardEvolucao } from '../services/api';
import { DashboardEvolution, DashboardMeasureKey } from '../types';

type StudentEvolutionScreenProps = {
  token: string;
  onBack: () => void;
  onLogout: () => void;
};

const measureOptions: Array<{ key: DashboardMeasureKey; label: string }> = [
  { key: 'bracoDireito', label: 'Braço' },
  { key: 'peitoral', label: 'Peitoral' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'abdomen', label: 'Abdômen' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'coxaDireita', label: 'Coxa' },
  { key: 'panturrilhaDireita', label: 'Panturrilha' },
];

export function StudentEvolutionScreen({
  token,
  onBack,
  onLogout,
}: StudentEvolutionScreenProps) {
  const [dashboard, setDashboard] = useState<DashboardEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeasure, setSelectedMeasure] =
    useState<DashboardMeasureKey>('cintura');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const selectedExercise = useMemo(
    () =>
      dashboard?.graficos.cargas.find(
        (exercise) => exercise.exercicioId === selectedExerciseId,
      ) ??
      dashboard?.graficos.cargas[0] ??
      null,
    [dashboard, selectedExerciseId],
  );
  const selectedMeasureData = dashboard?.graficos.medidas[selectedMeasure];

  const loadDashboard = useCallback(async () => {
    setError(null);

    try {
      const data = await getDashboardEvolucao(token);
      setDashboard(data);
      setSelectedExerciseId(
        (current) => current ?? data.graficos.cargas[0]?.exercicioId ?? null,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar sua evolução.',
      );
    }
  }, [token]);

  useEffect(() => {
    async function boot() {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    }

    boot();
  }, [loadDashboard]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
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
          <Pressable onPress={onBack} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
          <Pressable onPress={onLogout} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </Pressable>
        </View>

        <Text style={styles.kicker}>Minha Evolução</Text>
        <Text style={styles.title}>Seu progresso completo</Text>
        <Text style={styles.subtitle}>
          Peso, medidas, cargas, recordes e consistência em um só lugar.
        </Text>

        {loading ? <DashboardSkeleton /> : null}

        {!loading && error ? (
          <GlassCard style={styles.stateCard}>
            <Text style={styles.stateTitle}>Evolução indisponível</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={handleRefresh} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Tentar novamente</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        {!loading && !error && dashboard ? (
          <>
            <GlassCard style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroLabel}>Peso atual</Text>
                  <Text style={styles.heroTitle}>
                    {formatWeight(dashboard.resumoPeso.pesoAtual) ?? 'Sem dados'}
                  </Text>
                  <Text style={styles.heroText}>
                    {formatWeightDelta(dashboard.resumoPeso.diferenca)} desde a primeira
                    avaliação
                  </Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {formatPercent(dashboard.resumoPeso.percentual)}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.metricsGrid}>
              <DashboardMetricCard
                detail="Primeira avaliação"
                label="Peso inicial"
                tone="purple"
                value={formatWeight(dashboard.resumoPeso.pesoInicial) ?? 'Sem dados'}
              />
              <DashboardMetricCard
                detail="Diferença total"
                label="Evolução"
                tone="green"
                value={formatWeightDelta(dashboard.resumoPeso.diferenca)}
              />
            </View>

            <View style={styles.metricsGrid}>
              <DashboardMetricCard
                label="IMC"
                value={formatNumber(dashboard.resumoCorporal.imc) ?? 'Sem dados'}
              />
              <DashboardMetricCard
                label="Gordura"
                tone="purple"
                value={formatPercent(dashboard.resumoCorporal.percentualGordura)}
              />
            </View>

            <View style={styles.metricsGrid}>
              <DashboardMetricCard
                label="Massa magra"
                tone="green"
                value={formatWeight(dashboard.resumoCorporal.massaMagra) ?? 'Sem dados'}
              />
              <DashboardMetricCard
                label="Abdômen"
                value={formatCentimeters(
                  dashboard.resumoCorporal.circunferenciaAbdominal,
                )}
              />
            </View>

            <GlassCard style={styles.card}>
              <SectionTitle title="Gráfico de peso" subtitle="Primeira avaliação até hoje" />
              <EvolutionLineChart points={dashboard.graficos.peso} unit="kg" />
            </GlassCard>

            <GlassCard style={styles.card}>
              <SectionTitle title="Medidas corporais" subtitle="Escolha uma medida" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                {measureOptions.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setSelectedMeasure(option.key)}
                    style={[
                      styles.tab,
                      selectedMeasure === option.key ? styles.tabActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        selectedMeasure === option.key ? styles.tabTextActive : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <EvolutionLineChart
                emptyLabel="Sem medidas para este indicador"
                points={selectedMeasureData?.points ?? []}
                unit="cm"
              />
            </GlassCard>

            <GlassCard style={styles.card}>
              <SectionTitle title="Evolução de carga" subtitle="Histórico global por exercício" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                {dashboard.graficos.cargas.map((exercise) => (
                  <Pressable
                    key={exercise.exercicioId}
                    onPress={() => setSelectedExerciseId(exercise.exercicioId)}
                    style={[
                      styles.tab,
                      selectedExercise?.exercicioId === exercise.exercicioId
                        ? styles.tabActive
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        selectedExercise?.exercicioId === exercise.exercicioId
                          ? styles.tabTextActive
                          : null,
                      ]}
                    >
                      {exercise.nome}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <EvolutionLineChart
                emptyLabel="Registre mais cargas para formar o gráfico"
                points={selectedExercise?.points ?? []}
                unit="kg"
              />
            </GlassCard>

            <GlassCard style={styles.card}>
              <SectionTitle title="Meus Recordes" subtitle="Marcas que contam sua evolução" />
              <RecordRow
                label="Maior carga"
                value={formatRecordLoad(dashboard.recordes.maiorCarga)}
              />
              <RecordRow
                label="Maior evolução"
                value={formatRecordEvolution(dashboard.recordes.maiorEvolucao)}
              />
              <RecordRow
                label="Exercício favorito"
                value={formatRecordCount(dashboard.recordes.exercicioFavorito)}
              />
              <RecordRow
                label="Mais executado"
                value={formatRecordCount(dashboard.recordes.exercicioMaisExecutado)}
              />
            </GlassCard>

            <GlassCard style={styles.card}>
              <SectionTitle title="Treinos" subtitle="Frequência e consistência" />
              <View style={styles.trainingGrid}>
                <TrainingItem label="Este mês" value={dashboard.treinos.esteMes} />
                <TrainingItem label="Este ano" value={dashboard.treinos.esteAno} />
                <TrainingItem label="Sequência" value={dashboard.treinos.diasConsecutivos} />
                <TrainingItem label="Maior sequência" value={dashboard.treinos.maiorSequencia} />
              </View>
              <View style={styles.consistencyPanel}>
                <View>
                  <Text style={styles.consistencyLabel}>Consistência</Text>
                  <Text style={styles.consistencyValue}>{dashboard.consistencia.nivel}</Text>
                </View>
                <Text style={styles.consistencyScore}>{dashboard.consistencia.score}%</Text>
              </View>
              <ProgressBar
                height={10}
                progress={dashboard.consistencia.score}
                style={styles.progressBar}
              />
            </GlassCard>

            <GlassCard style={styles.card}>
              <SectionTitle title="Insights" subtitle="Leitura simples, sem IA ainda" />
              <View style={styles.insightList}>
                {dashboard.insights.map((insight) => (
                  <View key={insight} style={styles.insightItem}>
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{subtitle}</Text>
    </View>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.recordRow}>
      <Text style={styles.recordLabel}>{label}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  );
}

function TrainingItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.trainingItem}>
      <Text style={styles.trainingValue}>{value}</Text>
      <Text style={styles.trainingLabel}>{label}</Text>
    </View>
  );
}

function formatWeight(value?: number | string | null) {
  const numberValue = toNumber(value);
  if (numberValue === null) return null;
  return `${numberValue.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} kg`;
}

function formatWeightDelta(value?: number | null) {
  if (value === null || value === undefined) return 'Sem dados';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return 'Sem dados';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return null;
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function formatCentimeters(value?: number | null) {
  if (value === null || value === undefined) return 'Sem dados';
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} cm`;
}

function formatRecordLoad(record: DashboardEvolution['recordes']['maiorCarga']) {
  if (!record) return 'Sem dados';
  return `${record.exercicio} · ${formatWeight(record.carga)}`;
}

function formatRecordEvolution(record: DashboardEvolution['recordes']['maiorEvolucao']) {
  if (!record) return 'Sem dados';
  return `${record.exercicio} · ${formatWeightDelta(record.diferenca)}`;
}

function formatRecordCount(record: DashboardEvolution['recordes']['exercicioFavorito']) {
  if (!record) return 'Sem dados';
  return `${record.exercicio} · ${record.quantidade}x`;
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
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderRadius: 220,
    bottom: 40,
    height: 300,
    left: -170,
    position: 'absolute',
    width: 300,
  },
  content: { padding: 20, paddingBottom: 42, paddingTop: 54 },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: '#F4F7FF', fontSize: 12, fontWeight: '900' },
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
    marginTop: 5,
  },
  subtitle: {
    color: '#A8B3C4',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
  },
  stateCard: { alignItems: 'center', marginTop: 20, padding: 22 },
  stateTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  stateText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  heroCard: { marginTop: 20, padding: 18 },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
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
    fontSize: 35,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 8,
  },
  heroText: {
    color: '#A8B3C4',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.34)',
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  progressBadgeText: {
    color: '#D7FF8C',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  metricsGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  card: { marginTop: 16, padding: 18 },
  tabs: { marginTop: 14 },
  tab: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tabActive: { backgroundColor: 'rgba(183,255,74,0.18)', borderColor: '#B7FF4A' },
  tabText: { color: '#A8B3C4', fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: '#E8FFB8' },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  sectionHint: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 4 },
  recordRow: {
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    gap: 6,
    paddingVertical: 13,
  },
  recordLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '900' },
  recordValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  trainingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  trainingItem: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 13,
    width: '47%',
  },
  trainingValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  trainingLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '900', marginTop: 4 },
  consistencyPanel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  consistencyLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '900' },
  consistencyValue: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', marginTop: 4 },
  consistencyScore: { color: '#B7FF4A', fontSize: 22, fontWeight: '900' },
  progressBar: { marginTop: 18 },
  insightList: { gap: 12, marginTop: 16 },
  insightItem: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  insightDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  insightText: { color: '#DDE6F5', flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: '#07110B', fontSize: 14, fontWeight: '900' },
});
