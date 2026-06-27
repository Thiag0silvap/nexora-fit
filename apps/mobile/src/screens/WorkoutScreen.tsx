import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { ExerciseExecutionModal } from '../components/ExerciseExecutionModal';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { RestTimer } from '../components/RestTimer';
import {
  ActiveWorkout,
  CreateExecutionPayload,
  LatestExecution,
  LatestExecutionsByWorkoutExercise,
  StudentProfile,
  WorkoutExercise,
} from '../types';

type WorkoutScreenProps = {
  profile: StudentProfile | null;
  workout: ActiveWorkout | null;
  loading: boolean;
  error?: string | null;
  completedExercises: Record<string, boolean>;
  executionSuccess?: string | null;
  latestExecutions: LatestExecutionsByWorkoutExercise;
  onLogout: () => void;
  onBackToDashboard: () => void;
  onOpenEvaluationHistory: () => void;
  onRegisterExecution: (
    exercise: WorkoutExercise,
    values: Omit<CreateExecutionPayload, 'exercicioDivisaoId'>,
  ) => Promise<void>;
  onRetry: () => void;
  onSuccessDismiss: () => void;
};

type ActiveRestTimer = {
  exerciseId: string;
  durationSeconds: number;
  remainingSeconds: number;
  status: 'running' | 'finished';
};

export function WorkoutScreen({
  profile,
  workout,
  loading,
  error,
  completedExercises,
  executionSuccess,
  latestExecutions,
  onLogout,
  onBackToDashboard,
  onOpenEvaluationHistory,
  onRegisterExecution,
  onRetry,
  onSuccessDismiss,
}: WorkoutScreenProps) {
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [savingExecution, setSavingExecution] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<ActiveRestTimer | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const alunoNome = profile?.usuario.nome ?? workout?.aluno.usuario.nome ?? 'Aluno';
  const primeiroNome = alunoNome.split(' ')[0] || 'Aluno';
  const instrutorNome = workout?.instrutor.usuario.nome ?? 'Instrutor';
  const objetivo = profile?.aluno.objetivo ?? workout?.aluno.objetivo ?? 'Objetivo';
  const pesoAtual = formatWeight(profile?.aluno.pesoAtual ?? workout?.aluno.pesoAtual);
  const hasWorkout = Boolean(workout && workout.divisoes.length > 0);
  const selectedDivision =
    workout?.divisoes.find((division) => division.id === selectedDivisionId) ??
    workout?.divisoes[0] ??
    null;
  const selectedTotal = selectedDivision?.exerciciosDivisao.length ?? 0;
  const selectedCompleted =
    selectedDivision?.exerciciosDivisao.filter((exercise) => completedExercises[exercise.id])
      .length ?? 0;
  const selectedProgressPercent = calculatePercent(selectedCompleted, selectedTotal);
  const selectedWorkoutCompleted =
    selectedTotal > 0 && selectedCompleted === selectedTotal;

  useEffect(() => {
    if (!workout?.divisoes.length) {
      setSelectedDivisionId(null);
      setExpandedExerciseId(null);
      return;
    }

    const selectedStillExists = workout.divisoes.some(
      (division) => division.id === selectedDivisionId,
    );

    if (!selectedStillExists) {
      setSelectedDivisionId(workout.divisoes[0].id);
    }
  }, [selectedDivisionId, workout]);

  useEffect(() => {
    setExpandedExerciseId(null);
  }, [selectedDivisionId]);

  useEffect(() => {
    if (!restTimer || restTimer.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      setRestTimer((current) => {
        if (!current || current.status !== 'running') {
          return current;
        }

        return {
          ...current,
          remainingSeconds: Math.max(0, current.remainingSeconds - 1),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer?.exerciseId, restTimer?.status]);

  useEffect(() => {
    if (!restTimer || restTimer.status !== 'running' || restTimer.remainingSeconds > 0) {
      return;
    }

    setRestTimer((current) => current ? { ...current, status: 'finished' } : null);
    Vibration.vibrate(350);
  }, [restTimer]);

  function startRest(exercise: WorkoutExercise) {
    const durationSeconds = exercise.descansoSegundos ?? 0;

    if (durationSeconds <= 0) {
      return;
    }

    setRestTimer({
      exerciseId: exercise.id,
      durationSeconds,
      remainingSeconds: durationSeconds,
      status: 'running',
    });
  }

  function cancelRest(exerciseId: string) {
    setRestTimer((current) => current?.exerciseId === exerciseId ? null : current);
  }

  function openExecutionModal(exercise: WorkoutExercise) {
    setExecutionError(null);
    setSelectedExercise(exercise);
    onSuccessDismiss();
  }

  function toggleExercise(exerciseId: string) {
    setExpandedExerciseId((current) => current === exerciseId ? null : exerciseId);
  }

  function closeExecutionModal() {
    if (savingExecution) {
      return;
    }

    setSelectedExercise(null);
    setExecutionError(null);
  }

  async function submitExecution(values: Omit<CreateExecutionPayload, 'exercicioDivisaoId'>) {
    if (!selectedExercise) {
      return;
    }

    setSavingExecution(true);
    setExecutionError(null);

    try {
      await onRegisterExecution(selectedExercise, values);
      setSelectedExercise(null);
    } catch (submitError) {
      setExecutionError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel registrar este exercicio.',
      );
    } finally {
      setSavingExecution(false);
    }
  }

  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>Nexora Fit</Text>
            <Text style={styles.title}>Ola, {primeiroNome}</Text>
          </View>
          <Pressable onPress={onBackToDashboard} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Dashboard</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onOpenEvaluationHistory}
          style={({ pressed }) => [
            styles.evaluationHistoryButton,
            pressed ? styles.evaluationHistoryButtonPressed : null,
          ]}
        >
          <View style={styles.evaluationHistoryCopy}>
            <Text style={styles.evaluationHistoryLabel}>Sua evolução</Text>
            <Text style={styles.evaluationHistoryTitle}>Histórico de avaliações</Text>
          </View>
          <View style={styles.evaluationHistoryArrow}>
            <Text style={styles.evaluationHistoryArrowText}>›</Text>
          </View>
        </Pressable>

        {hasWorkout ? (
          <ScrollView
            contentContainerStyle={styles.workoutTabsContent}
            decelerationRate="fast"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.workoutTabs}
          >
            {workout?.divisoes.map((division) => {
              const isSelected = division.id === selectedDivision?.id;

              return (
                <Pressable
                  key={division.id}
                  onPress={() => setSelectedDivisionId(division.id)}
                  style={[
                    styles.workoutTab,
                    isSelected ? styles.workoutTabSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.workoutTabText,
                      isSelected ? styles.workoutTabTextSelected : null,
                    ]}
                  >
                    {formatDivisionTabName(division.nome, division.ordem)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroLabel}>Treino de hoje</Text>
              <Text style={styles.workoutName}>
                {selectedDivision?.nome ?? workout?.nome ?? 'Meu Treino'}
              </Text>
            </View>
            <View style={styles.heroBadgeWrap}>
              <Badge label={workout?.status ?? 'ATIVA'} tone="green" />
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryItem label="Instrutor" value={instrutorNome} />
            <SummaryItem label="Objetivo" value={formatEnum(objetivo)} />
            <SummaryItem label="Peso atual" value={pesoAtual ?? '-'} />
          </View>

          {workout?.observacao ? (
            <Text style={styles.note}>{workout.observacao}</Text>
          ) : null}

          <View style={styles.progressPanel}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressLabel}>Progresso do treino</Text>
                <Text style={styles.progressText}>
                  {selectedCompleted} de {selectedTotal} exercicio
                  {selectedTotal === 1 ? '' : 's'} concluido
                  {selectedTotal === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.progressPercent}>{selectedProgressPercent}%</Text>
            </View>
            <ProgressBar
              progress={selectedProgressPercent}
              height={12}
              style={styles.progressBar}
            />
          </View>
        </GlassCard>

        {selectedWorkoutCompleted ? (
          <GlassCard style={styles.completedWorkoutCard}>
            <View style={styles.completedWorkoutIcon}>
              <Text style={styles.completedWorkoutIconText}>OK</Text>
            </View>
            <Text style={styles.completedWorkoutText}>
              Treino de hoje concluido! Excelente trabalho.
            </Text>
          </GlassCard>
        ) : null}

        {executionSuccess ? (
          <Pressable onPress={onSuccessDismiss}>
            <GlassCard style={styles.successCard}>
              <View style={styles.successDot} />
              <Text style={styles.successText}>{executionSuccess}</Text>
            </GlassCard>
          </Pressable>
        ) : null}

        {loading ? (
          <StateCard
            loading
            title="Preparando seu treino"
            text="Buscando sua ficha ativa e organizando as divisoes."
          />
        ) : error ? (
          <StateCard
            title="Sem ficha ativa"
            text={error}
            actionLabel="Tentar novamente"
            onAction={onRetry}
          />
        ) : !hasWorkout ? (
          <StateCard
            title="Treino ainda nao publicado"
            text="Quando seu instrutor liberar uma ficha ativa, ela aparecera aqui."
            actionLabel="Atualizar"
            onAction={onRetry}
          />
        ) : selectedDivision ? (
          <GlassCard key={selectedDivision.id} style={styles.divisionCard}>
            <View style={styles.divisionHeader}>
              <View style={styles.divisionMarker}>
                <Text style={styles.divisionMarkerText}>{selectedDivision.ordem}</Text>
              </View>
              <View style={styles.divisionTitleWrap}>
                <Text style={styles.divisionTitle}>{selectedDivision.nome}</Text>
                <Text style={styles.divisionSubtitle}>
                  {selectedCompleted} de {selectedTotal} concluido
                  {selectedTotal === 1 ? '' : 's'}
                </Text>
                <ProgressBar
                  progress={selectedProgressPercent}
                  height={7}
                  style={styles.divisionProgressBar}
                />
              </View>
            </View>

            {selectedDivision.exerciciosDivisao.map((item) => {
              const isExpanded = expandedExerciseId === item.id;
              const isCompleted = Boolean(completedExercises[item.id]);
              const isResting =
                restTimer?.exerciseId === item.id && restTimer.status === 'running';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.exerciseCard,
                    isExpanded ? styles.exerciseCardExpanded : null,
                    isCompleted ? styles.exerciseCardDone : null,
                  ]}
                >
                  <Pressable
                    accessibilityHint="Expande ou recolhe os detalhes do exercicio"
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => toggleExercise(item.id)}
                    style={({ pressed }) => [
                      styles.exerciseSummary,
                      pressed ? styles.exerciseSummaryPressed : null,
                    ]}
                  >
                    <View style={styles.exerciseSummaryTop}>
                      <View style={styles.exerciseTitleWrap}>
                        <Text numberOfLines={1} style={styles.exerciseName}>
                          {item.exercicio.nome}
                        </Text>
                        <View style={styles.exerciseMetaRow}>
                          <Text numberOfLines={1} style={styles.exerciseGroup}>
                            {formatEnum(item.exercicio.grupoMuscular)}
                          </Text>
                          {isResting ? (
                            <View style={styles.restingIndicator}>
                              <View style={styles.restingDot} />
                              <Text style={styles.restingText}>
                                {formatTimer(restTimer.remainingSeconds)}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.exerciseStatusArea}>
                        <View
                          style={[
                            styles.compactStatus,
                            isCompleted
                              ? styles.compactStatusDone
                              : styles.compactStatusPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.compactStatusText,
                              isCompleted ? styles.compactStatusTextDone : null,
                            ]}
                          >
                            {isCompleted ? 'Concluido' : 'Pendente'}
                          </Text>
                        </View>
                        <View style={styles.expandButton}>
                          <Text style={styles.expandButtonText}>{isExpanded ? '-' : '+'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.compactMetrics}>
                      <CompactMetric label="Series" value={String(item.series)} />
                      <CompactMetric label="Reps" value={item.repeticoes} />
                      <CompactMetric
                        label="Descanso"
                        value={item.descansoSegundos ? `${item.descansoSegundos}s` : '-'}
                      />
                    </View>
                  </Pressable>

                  {isExpanded ? (
                    <View style={styles.exerciseDetails}>
                      {item.observacao ? (
                        <View style={styles.exerciseNotePanel}>
                          <Text style={styles.exerciseNoteLabel}>Orientacao</Text>
                          <Text style={styles.exerciseNote}>{item.observacao}</Text>
                        </View>
                      ) : null}

                      <HistoryCard latestExecution={latestExecutions[item.id] ?? null} />

                      <RestTimer
                        durationSeconds={item.descansoSegundos}
                        remainingSeconds={
                          restTimer?.exerciseId === item.id
                            ? restTimer.remainingSeconds
                            : undefined
                        }
                        status={
                          restTimer?.exerciseId === item.id
                            ? restTimer.status
                            : 'idle'
                        }
                        onCancel={() => cancelRest(item.id)}
                        onStart={() => startRest(item)}
                      />

                      <Pressable
                        onPress={() => openExecutionModal(item)}
                        style={({ pressed }) => [
                          styles.registerButton,
                          isCompleted ? styles.registerButtonDone : null,
                          pressed ? styles.registerButtonPressed : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.registerText,
                            isCompleted ? styles.registerTextDone : null,
                          ]}
                        >
                          {isCompleted ? 'Concluido' : 'Registrar carga'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </GlassCard>
        ) : null}
      </ScrollView>

      <ExerciseExecutionModal
        error={executionError}
        exercise={selectedExercise}
        onCancel={closeExecutionModal}
        onSubmit={submitExecution}
        saving={savingExecution}
        visible={Boolean(selectedExercise)}
      />
    </LinearGradient>
  );
}

function HistoryCard({ latestExecution }: { latestExecution: LatestExecution }) {
  if (!latestExecution) {
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyEmpty}>Sem historico ainda</Text>
      </View>
    );
  }

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyItem}>
        <Text style={styles.historyLabel}>Ultima carga</Text>
        <Text style={styles.historyValue}>{formatLoad(latestExecution.ultimaCarga)}</Text>
      </View>
      <View style={styles.historyDivider} />
      <View style={styles.historyItem}>
        <Text style={styles.historyLabel}>Ultima execucao</Text>
        <Text style={styles.historyValue}>
          {formatDate(latestExecution.ultimaExecucao)}
        </Text>
      </View>
    </View>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compactMetric}>
      <Text style={styles.compactMetricValue}>{value}</Text>
      <Text style={styles.compactMetricLabel}>{label}</Text>
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StateCard({
  loading,
  title,
  text,
  actionLabel,
  onAction,
}: {
  loading?: boolean;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <GlassCard style={styles.stateCard}>
      {loading ? <ActivityIndicator color="#B7FF4A" /> : <View style={styles.stateDot} />}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.retryButton}>
          <Text style={styles.retryText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </GlassCard>
  );
}

function formatWeight(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return `${Number(value).toFixed(1)} kg`;
}

function calculatePercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function formatDivisionTabName(name: string, order: number) {
  const match = name.match(/Treino\s+[A-Z]/i);

  if (match) {
    return match[0];
  }

  return `Treino ${order}`;
}

function formatLoad(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `${value} kg`;
  }

  return `${numericValue.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: numericValue % 1 === 0 ? 0 : 1,
  })} kg`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-BR');
}

function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatEnum(value?: string | null) {
  if (!value) {
    return '-';
  }

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
    backgroundColor: 'rgba(183,255,74,0.18)',
    borderRadius: 180,
    height: 260,
    position: 'absolute',
    right: -120,
    top: -90,
    width: 260,
  },
  glowBottom: {
    backgroundColor: 'rgba(139,92,246,0.20)',
    borderRadius: 220,
    bottom: 120,
    height: 300,
    left: -160,
    position: 'absolute',
    width: 300,
  },
  content: {
    padding: 20,
    paddingBottom: 38,
    paddingTop: 58,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  kicker: {
    color: '#B7FF4A',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '900',
  },
  workoutTabs: {
    marginBottom: 14,
    marginHorizontal: -20,
    overflow: 'visible',
  },
  evaluationHistoryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.08)',
    borderColor: 'rgba(183,255,74,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  evaluationHistoryButtonPressed: {
    backgroundColor: 'rgba(183,255,74,0.13)',
    opacity: 0.84,
  },
  evaluationHistoryCopy: {
    flex: 1,
  },
  evaluationHistoryLabel: {
    color: '#8FA17B',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  evaluationHistoryTitle: {
    color: '#EAFED5',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },
  evaluationHistoryArrow: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.13)',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  evaluationHistoryArrowText: {
    color: '#B7FF4A',
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 27,
  },
  workoutTabsContent: {
    gap: 10,
    paddingLeft: 20,
    paddingRight: 34,
  },
  workoutTab: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  workoutTabSelected: {
    backgroundColor: '#B7FF4A',
    borderColor: '#B7FF4A',
  },
  workoutTabText: {
    color: '#D7DFEA',
    fontSize: 13,
    fontWeight: '900',
  },
  workoutTabTextSelected: {
    color: '#07110B',
  },
  heroCard: {
    marginBottom: 16,
    padding: 20,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  heroTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroBadgeWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
    paddingTop: 2,
  },
  heroLabel: {
    color: '#9EAABC',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  workoutName: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  summaryItem: {
    backgroundColor: 'rgba(5,8,14,0.58)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    padding: 12,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#8E9AAF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  note: {
    color: '#BAC4D3',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
  },
  progressPanel: {
    backgroundColor: 'rgba(5,8,14,0.58)',
    borderColor: 'rgba(183,255,74,0.18)',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  progressHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  progressText: {
    color: '#D7DFEA',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  progressBar: {
    marginTop: 13,
  },
  completedWorkoutCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  completedWorkoutIcon: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  completedWorkoutIconText: {
    color: '#07110B',
    fontSize: 13,
    fontWeight: '900',
  },
  completedWorkoutText: {
    color: '#DDFEC6',
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  successCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  successDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  successText: {
    color: '#DDFEC6',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  stateCard: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  stateDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 10,
    height: 14,
    width: 14,
  },
  stateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateText: {
    color: '#B8C2D1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#B7FF4A',
    borderRadius: 16,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: '#07110B',
    fontSize: 14,
    fontWeight: '900',
  },
  divisionCard: {
    marginBottom: 16,
    padding: 16,
  },
  divisionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  divisionMarker: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  divisionMarkerText: {
    color: '#07110B',
    fontSize: 16,
    fontWeight: '900',
  },
  divisionTitleWrap: {
    flex: 1,
  },
  divisionTitle: {
    color: '#F7FAFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  divisionSubtitle: {
    color: '#8E9AAF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  divisionProgressBar: {
    marginTop: 10,
  },
  exerciseCard: {
    backgroundColor: 'rgba(5,8,14,0.76)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  exerciseCardExpanded: {
    borderColor: 'rgba(183,255,74,0.22)',
  },
  exerciseCardDone: {
    borderColor: 'rgba(183,255,74,0.35)',
    backgroundColor: 'rgba(19,32,19,0.72)',
  },
  exerciseSummary: {
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  exerciseSummaryPressed: {
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  exerciseSummaryTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  exerciseTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  exerciseMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  exerciseGroup: {
    color: '#8E9AAF',
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  restingIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.09)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  restingDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  restingText: {
    color: '#DDFEC6',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  exerciseStatusArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  compactStatus: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  compactStatusPending: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  compactStatusDone: {
    backgroundColor: 'rgba(183,255,74,0.14)',
  },
  compactStatusText: {
    color: '#9EAABC',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  compactStatusTextDone: {
    color: '#DDFEC6',
  },
  expandButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  expandButtonText: {
    color: '#E9EEF6',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  compactMetrics: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 9,
  },
  compactMetric: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: 9,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 27,
    paddingHorizontal: 7,
  },
  compactMetricValue: {
    color: '#F7FAFF',
    fontSize: 11,
    fontWeight: '900',
  },
  compactMetricLabel: {
    color: '#7F8A9D',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  exerciseDetails: {
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    padding: 13,
    paddingTop: 12,
  },
  exerciseNotePanel: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: 14,
    padding: 11,
  },
  exerciseNoteLabel: {
    color: '#8E9AAF',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  exerciseNote: {
    color: '#B8C2D1',
    fontSize: 13,
    lineHeight: 19,
  },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(183,255,74,0.16)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    minHeight: 70,
    padding: 12,
  },
  historyItem: {
    flex: 1,
  },
  historyLabel: {
    color: '#8E9AAF',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  historyValue: {
    color: '#F7FAFF',
    fontSize: 16,
    fontWeight: '900',
  },
  historyDivider: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    width: 1,
  },
  historyEmpty: {
    alignSelf: 'center',
    color: '#9EAABC',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  registerButtonDone: {
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.32)',
    borderWidth: 1,
  },
  registerButtonPressed: {
    opacity: 0.78,
  },
  registerText: {
    color: '#07110B',
    fontSize: 14,
    fontWeight: '900',
  },
  registerTextDone: {
    color: '#DDFEC6',
  },
});
