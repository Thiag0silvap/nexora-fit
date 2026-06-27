import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AddExerciseToDivisionModal } from '../components/AddExerciseToDivisionModal';
import { Badge } from '../components/Badge';
import { CreateWorkoutDivisionModal } from '../components/CreateWorkoutDivisionModal';
import { CreateWorkoutModal } from '../components/CreateWorkoutModal';
import { CreatePhysicalEvaluationModal } from '../components/CreatePhysicalEvaluationModal';
import { DuplicateWorkoutModal } from '../components/DuplicateWorkoutModal';
import { EditExerciseDivisionModal } from '../components/EditExerciseDivisionModal';
import { EditWorkoutDivisionModal } from '../components/EditWorkoutDivisionModal';
import { GlassCard } from '../components/GlassCard';
import { MetricBadge } from '../components/MetricBadge';
import {
  createDivisaoTreino,
  createExercicioDivisao,
  createAvaliacaoFisica,
  createFichaTreino,
  deleteDivisaoTreino,
  deleteExercicioDivisao,
  duplicateFichaTreino,
  getExercicios,
  getFichaTreinoById,
  getFichasTreinoByAluno,
  getUltimaAvaliacaoFisicaByAluno,
  updateDivisaoTreino,
  updateExercicioDivisao,
} from '../services/api';
import {
  Exercise,
  InstructorStudent,
  InstructorWorkout,
  BodyMeasures,
  PhysicalEvaluation,
  WorkoutDivision,
  WorkoutExercise,
} from '../types';

type InstructorStudentWorkoutScreenProps = {
  token: string;
  instructorId?: string;
  student: InstructorStudent;
  onBack: () => void;
  onLogout: () => void;
};

export function InstructorStudentWorkoutScreen({
  token,
  instructorId,
  student,
  onBack,
  onLogout,
}: InstructorStudentWorkoutScreenProps) {
  const [workout, setWorkout] = useState<InstructorWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingWorkout, setCreatingWorkout] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [latestEvaluation, setLatestEvaluation] = useState<PhysicalEvaluation | null>(null);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicatingWorkout, setDuplicatingWorkout] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [divisionModalVisible, setDivisionModalVisible] = useState(false);
  const [creatingDivision, setCreatingDivision] = useState(false);
  const [divisionError, setDivisionError] = useState<string | null>(null);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<WorkoutDivision | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [creatingDivisionExercise, setCreatingDivisionExercise] = useState(false);
  const [divisionExerciseError, setDivisionExerciseError] = useState<string | null>(null);
  const [editDivisionModalVisible, setEditDivisionModalVisible] = useState(false);
  const [selectedEditDivision, setSelectedEditDivision] = useState<WorkoutDivision | null>(null);
  const [editingDivision, setEditingDivision] = useState(false);
  const [editDivisionError, setEditDivisionError] = useState<string | null>(null);
  const [editExerciseModalVisible, setEditExerciseModalVisible] = useState(false);
  const [selectedEditExercise, setSelectedEditExercise] = useState<WorkoutExercise | null>(null);
  const [editingDivisionExercise, setEditingDivisionExercise] = useState(false);
  const [editExerciseError, setEditExerciseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedDivisionId, setExpandedDivisionId] = useState<string | null>(null);
  const nextDivisionOrder = getNextDivisionOrder(workout);
  const nextDivisionExerciseOrder = getNextDivisionExerciseOrder(selectedDivision);

  async function loadWorkout() {
    setLoading(true);
    setError(null);

    try {
      const [summaries, latestPhysicalEvaluation] = await Promise.all([
        getFichasTreinoByAluno(token, student.id),
        getUltimaAvaliacaoFisicaByAluno(token, student.id),
      ]);
      const activeWorkout = summaries.find((item) => item.status === 'ATIVA');

      setLatestEvaluation(latestPhysicalEvaluation);

      if (!activeWorkout) {
        setWorkout(null);
        setError('Este aluno ainda nao possui ficha ativa.');
        return;
      }

      const fullWorkout = await getFichaTreinoById(token, activeWorkout.id);
      setWorkout(fullWorkout);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar a ficha do aluno.',
      );
      setWorkout(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvaluation(values: {
    peso?: number;
    observacao?: string;
    medidas?: Partial<Record<keyof BodyMeasures, number>>;
  }) {
    setSavingEvaluation(true);
    setEvaluationError(null);

    try {
      const createdEvaluation = await createAvaliacaoFisica(token, {
        alunoId: student.id,
        peso: values.peso,
        observacao: values.observacao,
        medidas: values.medidas,
      });

      setLatestEvaluation(createdEvaluation);
      setEvaluationModalVisible(false);
      setSuccessMessage('Avaliacao fisica registrada com sucesso.');
    } catch (createEvaluationError) {
      setEvaluationError(
        createEvaluationError instanceof Error
          ? createEvaluationError.message
          : 'Nao foi possivel registrar a avaliacao fisica.',
      );
    } finally {
      setSavingEvaluation(false);
    }
  }

  async function handleCreateWorkout(values: { nome: string; observacao?: string }) {
    if (!instructorId) {
      setCreateError('Nao foi possivel identificar o perfil de instrutor.');
      return;
    }

    setCreatingWorkout(true);
    setCreateError(null);

    try {
      const createdWorkout = await createFichaTreino(token, {
        alunoId: student.id,
        instrutorId: instructorId,
        nome: values.nome,
        observacao: values.observacao,
      });

      setWorkout(createdWorkout);
      setCreateModalVisible(false);
      setSuccessMessage('Ficha criada com sucesso.');
      await loadWorkout();
    } catch (createWorkoutError) {
      setCreateError(
        createWorkoutError instanceof Error
          ? createWorkoutError.message
          : 'Nao foi possivel criar a ficha.',
      );
    } finally {
      setCreatingWorkout(false);
    }
  }

  async function handleDuplicateWorkout(values: { nome: string; observacao?: string }) {
    if (!workout) {
      setDuplicateError('Nenhuma ficha ativa encontrada para duplicar.');
      return;
    }

    setDuplicatingWorkout(true);
    setDuplicateError(null);

    try {
      const duplicatedWorkout = await duplicateFichaTreino(token, workout.id, values);

      setWorkout(duplicatedWorkout);
      setExpandedDivisionId(duplicatedWorkout.divisoes[0]?.id ?? null);
      setDuplicateModalVisible(false);
      setSuccessMessage('Ficha duplicada com sucesso.');
      await loadWorkout();
    } catch (duplicateWorkoutError) {
      setDuplicateError(
        duplicateWorkoutError instanceof Error
          ? duplicateWorkoutError.message
          : 'Nao foi possivel duplicar a ficha.',
      );
    } finally {
      setDuplicatingWorkout(false);
    }
  }

  async function handleCreateDivision(values: { nome: string }) {
    if (!workout) {
      setDivisionError('Nenhuma ficha ativa encontrada para receber o treino.');
      return;
    }

    setCreatingDivision(true);
    setDivisionError(null);

    try {
      const createdDivision = await createDivisaoTreino(token, workout.id, {
        nome: values.nome,
        ordem: nextDivisionOrder,
      });

      setExpandedDivisionId(createdDivision.id);
      setDivisionModalVisible(false);
      setSuccessMessage('Treino adicionado com sucesso.');
      await loadWorkout();
    } catch (createDivisionError) {
      setDivisionError(
        createDivisionError instanceof Error
          ? createDivisionError.message
          : 'Nao foi possivel adicionar o treino.',
      );
    } finally {
      setCreatingDivision(false);
    }
  }

  async function loadExerciseLibrary() {
    setLoadingExercises(true);
    setDivisionExerciseError(null);

    try {
      const data = await getExercicios(token);
      setExercises(data);
    } catch (loadExerciseError) {
      setDivisionExerciseError(
        loadExerciseError instanceof Error
          ? loadExerciseError.message
          : 'Nao foi possivel carregar a biblioteca de exercicios.',
      );
    } finally {
      setLoadingExercises(false);
    }
  }

  async function openExerciseModal(division: WorkoutDivision) {
    setSelectedDivision(division);
    setDivisionExerciseError(null);
    setExerciseModalVisible(true);

    if (exercises.length === 0) {
      await loadExerciseLibrary();
    }
  }

  async function handleCreateDivisionExercise(values: {
    exercicioId: string;
    series: number;
    repeticoes: string;
    descansoSegundos?: number;
    observacao?: string;
  }) {
    if (!selectedDivision) {
      setDivisionExerciseError('Selecione um treino para receber o exercicio.');
      return;
    }

    setCreatingDivisionExercise(true);
    setDivisionExerciseError(null);

    try {
      await createExercicioDivisao(token, selectedDivision.id, {
        ...values,
        ordem: nextDivisionExerciseOrder,
      });

      setExpandedDivisionId(selectedDivision.id);
      setExerciseModalVisible(false);
      setSelectedDivision(null);
      setSuccessMessage('Exercicio adicionado com sucesso.');
      await loadWorkout();
    } catch (createExerciseError) {
      setDivisionExerciseError(
        createExerciseError instanceof Error
          ? createExerciseError.message
          : 'Nao foi possivel adicionar o exercicio.',
      );
    } finally {
      setCreatingDivisionExercise(false);
    }
  }

  function openEditDivisionModal(division: WorkoutDivision) {
    setSelectedEditDivision(division);
    setEditDivisionError(null);
    setEditDivisionModalVisible(true);
  }

  async function handleUpdateDivision(values: { nome: string; ordem: number }) {
    if (!selectedEditDivision) {
      setEditDivisionError('Selecione um treino para editar.');
      return;
    }

    setEditingDivision(true);
    setEditDivisionError(null);

    try {
      await updateDivisaoTreino(token, selectedEditDivision.id, values);
      setExpandedDivisionId(selectedEditDivision.id);
      setEditDivisionModalVisible(false);
      setSelectedEditDivision(null);
      setSuccessMessage('Treino atualizado com sucesso.');
      await loadWorkout();
    } catch (updateDivisionError) {
      setEditDivisionError(
        updateDivisionError instanceof Error
          ? updateDivisionError.message
          : 'Nao foi possivel atualizar o treino.',
      );
    } finally {
      setEditingDivision(false);
    }
  }

  function confirmRemoveDivision(division: WorkoutDivision) {
    Alert.alert(
      'Remover treino',
      'Tem certeza que deseja remover este treino da ficha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            void handleRemoveDivision(division);
          },
        },
      ],
    );
  }

  async function handleRemoveDivision(division: WorkoutDivision) {
    try {
      await deleteDivisaoTreino(token, division.id);
      setExpandedDivisionId((currentId) => (currentId === division.id ? null : currentId));
      setSuccessMessage('Treino removido com sucesso.');
      await loadWorkout();
    } catch (removeDivisionError) {
      Alert.alert(
        'Nao foi possivel remover',
        removeDivisionError instanceof Error
          ? removeDivisionError.message
          : 'Nao foi possivel remover o treino.',
      );
    }
  }

  function openEditExerciseModal(exercise: WorkoutExercise) {
    setSelectedEditExercise(exercise);
    setEditExerciseError(null);
    setEditExerciseModalVisible(true);
  }

  async function handleUpdateExercise(values: {
    series: number;
    repeticoes: string;
    descansoSegundos?: number;
    observacao?: string;
    ordem: number;
  }) {
    if (!selectedEditExercise) {
      setEditExerciseError('Selecione um exercicio para editar.');
      return;
    }

    setEditingDivisionExercise(true);
    setEditExerciseError(null);

    try {
      await updateExercicioDivisao(token, selectedEditExercise.id, values);
      const parentDivision = workout?.divisoes.find((division) =>
        division.exerciciosDivisao.some((item) => item.id === selectedEditExercise.id),
      );

      if (parentDivision) {
        setExpandedDivisionId(parentDivision.id);
      }

      setEditExerciseModalVisible(false);
      setSelectedEditExercise(null);
      setSuccessMessage('Exercicio atualizado com sucesso.');
      await loadWorkout();
    } catch (updateExerciseError) {
      setEditExerciseError(
        updateExerciseError instanceof Error
          ? updateExerciseError.message
          : 'Nao foi possivel atualizar o exercicio.',
      );
    } finally {
      setEditingDivisionExercise(false);
    }
  }

  function confirmRemoveExercise(exercise: WorkoutExercise) {
    Alert.alert(
      'Remover exercicio',
      'Tem certeza que deseja remover este exercicio da ficha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            void handleRemoveExercise(exercise);
          },
        },
      ],
    );
  }

  async function handleRemoveExercise(exercise: WorkoutExercise) {
    try {
      await deleteExercicioDivisao(token, exercise.id);
      const parentDivision = workout?.divisoes.find((division) =>
        division.exerciciosDivisao.some((item) => item.id === exercise.id),
      );

      if (parentDivision) {
        setExpandedDivisionId(parentDivision.id);
      }

      setSuccessMessage('Exercicio removido com sucesso.');
      await loadWorkout();
    } catch (removeExerciseError) {
      Alert.alert(
        'Nao foi possivel remover',
        removeExerciseError instanceof Error
          ? removeExerciseError.message
          : 'Nao foi possivel remover o exercicio.',
      );
    }
  }

  useEffect(() => {
    setExpandedDivisionId(null);
    loadWorkout();
  }, [student.id, token]);

  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.kicker}>Ficha do aluno</Text>
              <Text style={styles.title}>{student.usuario.nome}</Text>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.subtitle}>
                {student.usuario.email ?? 'Email não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryItem label="Objetivo" value={formatEnum(student.objetivo)} />
            <SummaryItem label="Peso atual" value={formatWeight(student.pesoAtual)} />
          </View>

          <Pressable
            onPress={() => {
              setEvaluationError(null);
              setEvaluationModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.evaluationButton,
              pressed ? styles.newWorkoutButtonPressed : null,
            ]}
          >
            <Text style={styles.evaluationButtonText}>+ Avaliacao fisica</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setCreateError(null);
              setCreateModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.newWorkoutButton,
              pressed ? styles.newWorkoutButtonPressed : null,
            ]}
          >
            <Text style={styles.newWorkoutButtonText}>+ Nova ficha</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.evaluationCard}>
          <View style={styles.evaluationHeader}>
            <View>
              <Text style={styles.evaluationLabel}>Ultima avaliacao</Text>
              <Text style={styles.evaluationTitle}>
                {latestEvaluation ? formatDate(latestEvaluation.createdAt) : 'Sem registro'}
              </Text>
            </View>
            <View style={styles.weightPill}>
              <Text style={styles.weightPillValue}>
                {latestEvaluation?.peso ? formatWeight(latestEvaluation.peso) : '-'}
              </Text>
              <Text style={styles.weightPillLabel}>Peso</Text>
            </View>
          </View>

          {latestEvaluation ? (
            <>
              <View style={styles.evaluationMeasures}>
                <EvaluationMeasure
                  label="Cintura"
                  value={latestEvaluation.medidasCorporais?.cintura}
                />
                <EvaluationMeasure
                  label="Abdomen"
                  value={latestEvaluation.medidasCorporais?.abdomen}
                />
                <EvaluationMeasure
                  label="Peitoral"
                  value={latestEvaluation.medidasCorporais?.peitoral}
                />
                <EvaluationMeasure
                  label="Braco dir."
                  value={latestEvaluation.medidasCorporais?.bracoDireito}
                />
                <EvaluationMeasure
                  label="Coxa dir."
                  value={latestEvaluation.medidasCorporais?.coxaDireita}
                />
              </View>
              {latestEvaluation.observacao ? (
                <Text style={styles.evaluationNote}>{latestEvaluation.observacao}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.emptyEvaluationText}>
              Registre a primeira avaliacao para acompanhar peso e medidas.
            </Text>
          )}
        </GlassCard>

        {successMessage ? (
          <Pressable onPress={() => setSuccessMessage(null)}>
            <GlassCard style={styles.successCard}>
              <View style={styles.successDot} />
              <Text style={styles.successText}>{successMessage}</Text>
            </GlassCard>
          </Pressable>
        ) : null}

        {loading ? (
          <StateCard loading title="Carregando ficha" text="Buscando ficha ativa." />
        ) : error ? (
          <StateCard
            title="Ficha indisponivel"
            text={error}
            actionLabel="Tentar novamente"
            onAction={loadWorkout}
          />
        ) : workout ? (
          <>
            <GlassCard style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutTitleWrap}>
                  <Text style={styles.workoutLabel}>Ficha ativa</Text>
                  <Text style={styles.workoutTitle}>{workout.nome}</Text>
                </View>
                <Badge label={workout.status} tone="green" />
              </View>
              {workout.observacao ? (
                <Text style={styles.workoutNote}>{workout.observacao}</Text>
              ) : null}

              <Pressable
                onPress={() => {
                  setDivisionError(null);
                  setDivisionModalVisible(true);
                }}
                style={({ pressed }) => [
                  styles.addTrainingButton,
                  pressed ? styles.addTrainingButtonPressed : null,
                ]}
              >
                <Text style={styles.addTrainingButtonText}>+ Adicionar treino</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setDuplicateError(null);
                  setDuplicateModalVisible(true);
                }}
                style={({ pressed }) => [
                  styles.duplicateWorkoutButton,
                  pressed ? styles.addTrainingButtonPressed : null,
                ]}
              >
                <Text style={styles.duplicateWorkoutButtonText}>Duplicar ficha</Text>
              </Pressable>
            </GlassCard>

            {workout.divisoes.length === 0 ? (
              <GlassCard style={styles.emptyTrainingCard}>
                <View style={styles.emptyTrainingDot} />
                <Text style={styles.emptyTrainingTitle}>Nenhum treino cadastrado ainda.</Text>
                <Text style={styles.emptyTrainingText}>
                  Adicione o primeiro treino para montar a ficha do aluno.
                </Text>
              </GlassCard>
            ) : null}

            {workout.divisoes.map((division) => {
              const isExpanded = expandedDivisionId === division.id;

              return (
                <GlassCard
                  key={division.id}
                  style={isExpanded ? styles.divisionCardExpanded : styles.divisionCard}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setExpandedDivisionId((currentId) =>
                        currentId === division.id ? null : division.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.divisionHeader,
                      pressed ? styles.actionPressed : null,
                    ]}
                  >
                    <View style={styles.divisionMarker}>
                      <Text style={styles.divisionMarkerText}>{division.ordem}</Text>
                    </View>
                    <View style={styles.divisionTitleWrap}>
                      <Text style={styles.divisionTitle}>{division.nome}</Text>
                      <Text style={styles.divisionSubtitle}>
                        {division.exerciciosDivisao.length} exercicio
                        {division.exerciciosDivisao.length === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View style={styles.expandButton}>
                      <Text style={styles.expandButtonText}>{isExpanded ? '-' : '+'}</Text>
                    </View>
                  </Pressable>

                  {isExpanded ? (
                    <View style={styles.divisionContent}>
                      <View style={styles.actionRow}>
                        <Pressable
                          onPress={() => openEditDivisionModal(division)}
                          style={({ pressed }) => [
                            styles.secondaryActionButton,
                            pressed ? styles.actionPressed : null,
                          ]}
                        >
                          <Text style={styles.secondaryActionText}>Editar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => confirmRemoveDivision(division)}
                          style={({ pressed }) => [
                            styles.secondaryActionButton,
                            styles.dangerActionButton,
                            pressed ? styles.actionPressed : null,
                          ]}
                        >
                          <Text style={styles.dangerActionText}>Remover</Text>
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={() => openExerciseModal(division)}
                        style={({ pressed }) => [
                          styles.addExerciseButton,
                          pressed ? styles.addExerciseButtonPressed : null,
                        ]}
                      >
                        <Text style={styles.addExerciseButtonText}>+ Adicionar exercicio</Text>
                      </Pressable>

                      {division.exerciciosDivisao.length === 0 ? (
                        <View style={styles.emptyExerciseCard}>
                          <Text style={styles.emptyExerciseTitle}>Sem exercicios ainda.</Text>
                          <Text style={styles.emptyExerciseText}>
                            Adicione o primeiro exercicio deste treino.
                          </Text>
                        </View>
                      ) : null}

                      {division.exerciciosDivisao.map((item) => (
                        <View key={item.id} style={styles.exerciseCard}>
                          <View style={styles.exerciseHeader}>
                            <View style={styles.exerciseTitleWrap}>
                              <Text style={styles.exerciseName}>{item.exercicio.nome}</Text>
                              <Text style={styles.exerciseGroup}>
                                {formatEnum(item.exercicio.grupoMuscular)}
                              </Text>
                            </View>
                            <Badge label={item.exercicio.grupoMuscular} tone="purple" />
                          </View>

                          <View style={styles.metrics}>
                            <MetricBadge label="Series" value={String(item.series)} />
                            <MetricBadge label="Repeticoes" value={item.repeticoes} />
                            <MetricBadge
                              label="Descanso"
                              value={item.descansoSegundos ? `${item.descansoSegundos}s` : '-'}
                            />
                          </View>

                          {item.observacao ? (
                            <Text style={styles.exerciseNote}>{item.observacao}</Text>
                          ) : null}

                          <View style={styles.exerciseActions}>
                            <Pressable
                              onPress={() => openEditExerciseModal(item)}
                              style={({ pressed }) => [
                                styles.exerciseActionButton,
                                pressed ? styles.actionPressed : null,
                              ]}
                            >
                              <Text style={styles.secondaryActionText}>Editar</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => confirmRemoveExercise(item)}
                              style={({ pressed }) => [
                                styles.exerciseActionButton,
                                styles.dangerActionButton,
                                pressed ? styles.actionPressed : null,
                              ]}
                            >
                              <Text style={styles.dangerActionText}>Remover</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </GlassCard>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <CreateWorkoutModal
        error={createError}
        onCancel={() => {
          if (!creatingWorkout) {
            setCreateModalVisible(false);
            setCreateError(null);
          }
        }}
        onSubmit={handleCreateWorkout}
        saving={creatingWorkout}
        studentName={student.usuario.nome}
        visible={createModalVisible}
      />

      <CreatePhysicalEvaluationModal
        error={evaluationError}
        onCancel={() => {
          if (!savingEvaluation) {
            setEvaluationModalVisible(false);
            setEvaluationError(null);
          }
        }}
        onSubmit={handleCreateEvaluation}
        saving={savingEvaluation}
        studentName={student.usuario.nome}
        visible={evaluationModalVisible}
      />

      <CreateWorkoutDivisionModal
        error={divisionError}
        nextOrder={nextDivisionOrder}
        onCancel={() => {
          if (!creatingDivision) {
            setDivisionModalVisible(false);
            setDivisionError(null);
          }
        }}
        onSubmit={handleCreateDivision}
        saving={creatingDivision}
        visible={divisionModalVisible}
        workoutName={workout?.nome ?? 'ficha ativa'}
      />

      <DuplicateWorkoutModal
        error={duplicateError}
        onCancel={() => {
          if (!duplicatingWorkout) {
            setDuplicateModalVisible(false);
            setDuplicateError(null);
          }
        }}
        onSubmit={handleDuplicateWorkout}
        saving={duplicatingWorkout}
        visible={duplicateModalVisible}
        workoutName={workout?.nome ?? 'Ficha atual'}
      />

      <EditWorkoutDivisionModal
        division={selectedEditDivision}
        error={editDivisionError}
        onCancel={() => {
          if (!editingDivision) {
            setEditDivisionModalVisible(false);
            setSelectedEditDivision(null);
            setEditDivisionError(null);
          }
        }}
        onSubmit={handleUpdateDivision}
        saving={editingDivision}
        visible={editDivisionModalVisible}
      />

      <AddExerciseToDivisionModal
        divisionName={selectedDivision?.nome ?? 'Treino'}
        error={divisionExerciseError}
        exercises={exercises}
        loadingExercises={loadingExercises}
        nextOrder={nextDivisionExerciseOrder}
        onCancel={() => {
          if (!creatingDivisionExercise) {
            setExerciseModalVisible(false);
            setSelectedDivision(null);
            setDivisionExerciseError(null);
          }
        }}
        onReloadExercises={loadExerciseLibrary}
        onSubmit={handleCreateDivisionExercise}
        saving={creatingDivisionExercise}
        visible={exerciseModalVisible}
      />

      <EditExerciseDivisionModal
        error={editExerciseError}
        exercise={selectedEditExercise}
        onCancel={() => {
          if (!editingDivisionExercise) {
            setEditExerciseModalVisible(false);
            setSelectedEditExercise(null);
            setEditExerciseError(null);
          }
        }}
        onSubmit={handleUpdateExercise}
        saving={editingDivisionExercise}
        visible={editExerciseModalVisible}
      />
    </LinearGradient>
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

function EvaluationMeasure({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View style={styles.evaluationMeasureItem}>
      <Text style={styles.evaluationMeasureValue}>{formatMeasure(value)}</Text>
      <Text style={styles.evaluationMeasureLabel}>{label}</Text>
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
    return '-';
  }

  return `${Number(value).toFixed(1)} kg`;
}

function formatMeasure(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return `${Number(value).toFixed(1)} cm`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
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

function getNextDivisionOrder(workout: InstructorWorkout | null) {
  if (!workout?.divisoes.length) {
    return 1;
  }

  return Math.max(...workout.divisoes.map((division) => division.ordem)) + 1;
}

function getNextDivisionExerciseOrder(division: WorkoutDivision | null) {
  if (!division?.exerciciosDivisao.length) {
    return 1;
  }

  return Math.max(...division.exerciciosDivisao.map((exercise) => exercise.ordem)) + 1;
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
    paddingTop: 72,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: {
    color: '#F4F7FF',
    fontSize: 14,
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
  kicker: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
  },
  subtitle: {
    color: '#8E9AAF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  newWorkoutButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
  },
  newWorkoutButtonPressed: {
    opacity: 0.78,
  },
  newWorkoutButtonText: {
    color: '#07110B',
    fontSize: 15,
    fontWeight: '900',
  },
  evaluationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.32)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
  },
  evaluationButtonText: {
    color: '#DDFEC6',
    fontSize: 15,
    fontWeight: '900',
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
  evaluationCard: {
    marginBottom: 16,
    padding: 18,
  },
  evaluationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  evaluationLabel: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  evaluationTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  weightPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.13)',
    borderColor: 'rgba(183,255,74,0.26)',
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  weightPillValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  weightPillLabel: {
    color: '#B7FF4A',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  evaluationMeasures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  evaluationMeasureItem: {
    backgroundColor: 'rgba(5,8,14,0.58)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 11,
    width: '31%',
  },
  evaluationMeasureValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  evaluationMeasureLabel: {
    color: '#8E9AAF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  evaluationNote: {
    color: '#B8C2D1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  emptyEvaluationText: {
    color: '#B8C2D1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  workoutCard: {
    marginBottom: 16,
    padding: 18,
  },
  workoutHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  workoutTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  workoutLabel: {
    color: '#9EAABC',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  workoutNote: {
    color: '#BAC4D3',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  addTrainingButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.32)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 50,
  },
  addTrainingButtonPressed: {
    opacity: 0.78,
  },
  addTrainingButtonText: {
    color: '#DDFEC6',
    fontSize: 15,
    fontWeight: '900',
  },
  duplicateWorkoutButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 48,
  },
  duplicateWorkoutButtonText: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyTrainingCard: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: 24,
  },
  emptyTrainingDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 10,
    height: 14,
    width: 14,
  },
  emptyTrainingTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyTrainingText: {
    color: '#B8C2D1',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
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
  divisionCard: {
    marginBottom: 16,
    padding: 16,
  },
  divisionCardExpanded: {
    borderColor: 'rgba(183,255,74,0.24)',
    marginBottom: 16,
    padding: 16,
  },
  divisionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  expandButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.14)',
    borderColor: 'rgba(183,255,74,0.26)',
    borderRadius: 16,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  expandButtonText: {
    color: '#DDFEC6',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  divisionContent: {
    marginTop: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  secondaryActionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  secondaryActionText: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '900',
  },
  dangerActionButton: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.26)',
  },
  dangerActionText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '900',
  },
  actionPressed: {
    opacity: 0.72,
  },
  addExerciseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(183,255,74,0.22)',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 44,
  },
  addExerciseButtonPressed: {
    opacity: 0.78,
  },
  addExerciseButtonText: {
    color: '#DDFEC6',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyExerciseCard: {
    backgroundColor: 'rgba(5,8,14,0.54)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  emptyExerciseTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyExerciseText: {
    color: '#9EAABC',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 5,
  },
  exerciseCard: {
    backgroundColor: 'rgba(5,8,14,0.76)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  exerciseHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  exerciseTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  exerciseGroup: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  exerciseNote: {
    color: '#B8C2D1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  exerciseActionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
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
});
