import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './src/components/GlassCard';
import { EvaluationHistoryScreen } from './src/screens/EvaluationHistoryScreen';
import { InstructorStudentsScreen } from './src/screens/InstructorStudentsScreen';
import { InstructorStudentWorkoutScreen } from './src/screens/InstructorStudentWorkoutScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { StudentDashboardScreen } from './src/screens/StudentDashboardScreen';
import { StudentEvolutionScreen } from './src/screens/StudentEvolutionScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import {
  createExecucao,
  getExerciseEvolution,
  getAuthMe,
  getExecucoesHoje,
  getMyProfile,
  getMyWorkout,
  login,
  refreshTokens,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from './src/services/api';
import {
  ActiveWorkout,
  AuthenticatedUser,
  CreateExecutionPayload,
  InstructorStudent,
  LatestExecutionsByWorkoutExercise,
  StudentProfile,
  WorkoutExercise,
} from './src/types';

const SESSION_TOKEN_KEY = '@nexora-fit/session-token';
const REFRESH_TOKEN_KEY = '@nexora-fit/refresh-token';
const REMEMBERED_USER_KEY = '@nexora-fit/remembered-user';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);
  const [selectedInstructorStudent, setSelectedInstructorStudent] =
    useState<InstructorStudent | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [screenLoading, setScreenLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [rememberUser, setRememberUser] = useState(false);
  const [rememberedIdentifier, setRememberedIdentifier] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);
  const [latestExecutions, setLatestExecutions] =
    useState<LatestExecutionsByWorkoutExercise>({});
  const [studentScreen, setStudentScreen] =
    useState<'dashboard' | 'workout' | 'evaluations' | 'evolution'>('dashboard');
  const [evaluationBackScreen, setEvaluationBackScreen] =
    useState<'dashboard' | 'workout'>('dashboard');
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession('Sua sessão expirou. Faça login novamente.');
    });
    setTokenRefreshHandler(refreshStoredSession);

    return () => {
      setUnauthorizedHandler(null);
      setTokenRefreshHandler(null);
    };
  }, []);

  useEffect(() => {
    bootstrapSession();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (accessToken) {
      scheduleInactivityTimeout();
    } else if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, [accessToken]);

  async function bootstrapSession() {
    setBootLoading(true);

    try {
      const [savedToken, savedIdentifier] = await Promise.all([
        AsyncStorage.getItem(SESSION_TOKEN_KEY),
        AsyncStorage.getItem(REMEMBERED_USER_KEY),
      ]);
      const savedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (savedIdentifier) {
        setRememberUser(true);
        setRememberedIdentifier(savedIdentifier);
      }

      if (!savedToken && !savedRefreshToken) {
        return;
      }

      let validToken = savedToken;

      if (!validToken) {
        validToken = await refreshStoredSession();
      }

      if (!validToken) {
        return;
      }

      const user = await getAuthMe(validToken);
      const currentToken = (await AsyncStorage.getItem(SESSION_TOKEN_KEY)) ?? validToken;

      setAccessToken(currentToken);
      setAuthenticatedUser(user);
      setStudentScreen('dashboard');
      setEvaluationBackScreen('dashboard');

      if (user.role === 'ALUNO') {
        await loadStudentData(currentToken);
      }
    } catch {
      await Promise.all([
        AsyncStorage.removeItem(SESSION_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);
      setLoginError('Sua sessão expirou. Faça login novamente.');
    } finally {
      setBootLoading(false);
    }
  }

  async function refreshStoredSession() {
    const savedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (!savedRefreshToken) {
      return null;
    }

    try {
      const response = await refreshTokens(savedRefreshToken);

      await Promise.all([
        AsyncStorage.setItem(SESSION_TOKEN_KEY, response.accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken),
      ]);
      setAccessToken(response.accessToken);
      setAuthenticatedUser(response.user);

      return response.accessToken;
    } catch {
      await Promise.all([
        AsyncStorage.removeItem(SESSION_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);
      return null;
    }
  }

  function scheduleInactivityTimeout() {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      clearSession('Sessão encerrada por inatividade. Faça login novamente.');
    }, INACTIVITY_TIMEOUT_MS);
  }

  function registerActivity() {
    if (accessToken) {
      scheduleInactivityTimeout();
    }
  }

  async function clearSession(message?: string) {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    await Promise.all([
      AsyncStorage.removeItem(SESSION_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]);
    setAccessToken(null);
    setAuthenticatedUser(null);
    setProfile(null);
    setWorkout(null);
    setSelectedInstructorStudent(null);
    setScreenError(null);
    setCompletedExercises({});
    setExecutionSuccess(null);
    setLatestExecutions({});
    setStudentScreen('dashboard');
    setEvaluationBackScreen('dashboard');
    setLoginError(message ?? null);
  }

  async function loadLatestExecutions(token: string, workoutData: ActiveWorkout) {
    const exercises = workoutData.divisoes.flatMap(
      (division) => division.exerciciosDivisao,
    );

    const entries = await Promise.all(
      exercises.map(async (exercise) => {
        try {
          const latestExecution = await getExerciseEvolution(
            token,
            exercise.exercicio.id,
          );

          return [exercise.id, latestExecution] as const;
        } catch {
          return [exercise.id, null] as const;
        }
      }),
    );

    setLatestExecutions(Object.fromEntries(entries));
  }

  async function loadTodayProgress(token: string, workoutData: ActiveWorkout) {
    try {
      const todayExecutions = await getExecucoesHoje(token);
      const workoutExerciseIds = new Set(
        workoutData.divisoes.flatMap((division) =>
          division.exerciciosDivisao.map((exercise) => exercise.id),
        ),
      );

      const completedFromToday = todayExecutions.reduce<Record<string, boolean>>(
        (completed, execution) => {
          if (workoutExerciseIds.has(execution.exercicioDivisaoId)) {
            completed[execution.exercicioDivisaoId] = true;
          }

          return completed;
        },
        {},
      );

      setCompletedExercises(completedFromToday);
    } catch {
      setCompletedExercises({});
    }
  }

  async function loadStudentData(token: string) {
    setScreenLoading(true);
    setScreenError(null);
    setLatestExecutions({});
    setCompletedExercises({});

    try {
      const profileData = await getMyProfile(token);
      setProfile(profileData);

      try {
        const workoutData = await getMyWorkout(token);

        setWorkout(workoutData);
        await Promise.all([
          loadLatestExecutions(token, workoutData),
          loadTodayProgress(token, workoutData),
        ]);
      } catch (workoutError) {
        setScreenError(
          workoutError instanceof Error
            ? workoutError.message
            : 'Não foi possível carregar seu treino.',
        );
        setWorkout(null);
      }
    } catch (error) {
      setScreenError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar seu perfil.',
      );
      setProfile(null);
      setWorkout(null);
    } finally {
      setScreenLoading(false);
    }
  }

  async function handleLogin(identifier: string, senha: string, shouldRememberUser: boolean) {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await login(identifier, senha);
      await Promise.all([
        AsyncStorage.setItem(SESSION_TOKEN_KEY, response.accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken),
      ]);

      if (shouldRememberUser) {
        await AsyncStorage.setItem(REMEMBERED_USER_KEY, identifier);
        setRememberedIdentifier(identifier);
      } else {
        await AsyncStorage.removeItem(REMEMBERED_USER_KEY);
        setRememberedIdentifier('');
      }

      setRememberUser(shouldRememberUser);
      setAccessToken(response.accessToken);
      setAuthenticatedUser(response.user);
      setSelectedInstructorStudent(null);
      setCompletedExercises({});
      setExecutionSuccess(null);
      setStudentScreen('dashboard');
      setEvaluationBackScreen('dashboard');

      if (response.user.role === 'ALUNO') {
        await loadStudentData(response.accessToken);
      }
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : 'E-mail ou senha inválidos.',
      );
      setAccessToken(null);
      setAuthenticatedUser(null);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
  }

  async function handleRegisterExecution(
    exercise: WorkoutExercise,
    values: Omit<CreateExecutionPayload, 'exercicioDivisaoId'>,
  ) {
    if (!accessToken) {
      throw new Error('Sessão expirada. Entre novamente.');
    }

    const execucao = await createExecucao(accessToken, {
      exercicioDivisaoId: exercise.id,
      ...values,
    });
    let updatedEvolution = null;

    try {
      updatedEvolution = await getExerciseEvolution(accessToken, exercise.exercicio.id);
    } catch {
      updatedEvolution = null;
    }
    const sameExerciseIds =
      workout?.divisoes.flatMap((division) =>
        division.exerciciosDivisao
          .filter((item) => item.exercicio.id === exercise.exercicio.id)
          .map((item) => item.id),
      ) ?? [exercise.id];

    setCompletedExercises((current) => ({
      ...current,
      [exercise.id]: true,
    }));
    setLatestExecutions((current) => ({
      ...current,
      ...Object.fromEntries(
        sameExerciseIds.map((exerciseId) => [
          exerciseId,
          updatedEvolution ?? {
            ultimaCarga: execucao.carga,
            ultimaRepeticao: execucao.repeticoesRealizadas,
            ultimaExecucao: execucao.executadoEm,
            observacao: execucao.observacao,
          },
        ]),
      ),
    }));
    setExecutionSuccess(`${exercise.exercicio.nome} registrado com sucesso.`);
  }

  function openEvaluationHistory(from: 'dashboard' | 'workout') {
    setEvaluationBackScreen(from);
    setStudentScreen('evaluations');
  }

  return (
    <View
      onStartShouldSetResponderCapture={() => {
        registerActivity();
        return false;
      }}
      style={styles.appRoot}
    >
      <StatusBar style="light" />
      {bootLoading ? (
        <BootScreen />
      ) : accessToken && authenticatedUser?.role === 'ALUNO' ? (
        studentScreen === 'evaluations' && profile ? (
          <EvaluationHistoryScreen
            alunoId={profile.aluno.id}
            onBack={() => setStudentScreen(evaluationBackScreen)}
            onLogout={handleLogout}
            token={accessToken}
          />
        ) : studentScreen === 'evolution' ? (
          <StudentEvolutionScreen
            onBack={() => setStudentScreen('dashboard')}
            onLogout={handleLogout}
            token={accessToken}
          />
        ) : studentScreen === 'workout' ? (
          <WorkoutScreen
            error={screenError}
            loading={screenLoading}
            onLogout={handleLogout}
            onBackToDashboard={() => setStudentScreen('dashboard')}
            onOpenEvaluationHistory={() => openEvaluationHistory('workout')}
            onRegisterExecution={handleRegisterExecution}
            onRetry={() => loadStudentData(accessToken)}
            onSuccessDismiss={() => setExecutionSuccess(null)}
            profile={profile}
            completedExercises={completedExercises}
            executionSuccess={executionSuccess}
            latestExecutions={latestExecutions}
            workout={workout}
          />
        ) : (
          <StudentDashboardScreen
            completedExercises={completedExercises}
            error={screenError}
            loading={screenLoading}
            onLogout={handleLogout}
            onOpenEvolution={() => setStudentScreen('evolution')}
            onOpenEvaluationHistory={() => openEvaluationHistory('dashboard')}
            onOpenWorkout={() => setStudentScreen('workout')}
            onRefreshStudentData={() => loadStudentData(accessToken)}
            profile={profile}
            workout={workout}
          />
        )
      ) : accessToken && authenticatedUser?.role === 'INSTRUTOR' ? (
        selectedInstructorStudent ? (
          <InstructorStudentWorkoutScreen
            instructorId={authenticatedUser.instrutorId}
            onBack={() => setSelectedInstructorStudent(null)}
            onLogout={handleLogout}
            student={selectedInstructorStudent}
            token={accessToken}
          />
        ) : (
          <InstructorStudentsScreen
            onLogout={handleLogout}
            onSelectStudent={setSelectedInstructorStudent}
            token={accessToken}
            user={authenticatedUser}
          />
        )
      ) : accessToken && authenticatedUser ? (
        <UnsupportedProfileScreen role={authenticatedUser.role} onLogout={handleLogout} />
      ) : (
        <LoginScreen
          error={loginError}
          initialIdentifier={rememberedIdentifier}
          loading={loginLoading}
          onRememberUserChange={setRememberUser}
          onLogin={handleLogin}
          rememberUser={rememberUser}
        />
      )}
    </View>
  );
}

function BootScreen() {
  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.content}>
        <GlassCard style={styles.unsupportedCard}>
          <ActivityIndicator color="#B7FF4A" />
          <Text style={styles.unsupportedKicker}>Nexora Fit</Text>
          <Text style={styles.unsupportedTitle}>Carregando sessão</Text>
          <Text style={styles.unsupportedText}>
            Validando seu acesso antes de abrir o aplicativo.
          </Text>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

function UnsupportedProfileScreen({
  role,
  onLogout,
}: {
  role: string;
  onLogout: () => void;
}) {
  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.content}>
        <GlassCard style={styles.unsupportedCard}>
          <Text style={styles.unsupportedKicker}>Nexora Fit Mobile</Text>
          <Text style={styles.unsupportedTitle}>Perfil ainda não disponivel no mobile.</Text>
          <Text style={styles.unsupportedText}>
            O perfil {role} será liberado em uma próxima versão do aplicativo.
          </Text>
          <Pressable onPress={onLogout} style={styles.unsupportedButton}>
            <Text style={styles.unsupportedButtonText}>Sair</Text>
          </Pressable>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  unsupportedCard: {
    padding: 22,
  },
  unsupportedKicker: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  unsupportedTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
  },
  unsupportedText: {
    color: '#A8B3C4',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  unsupportedButton: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    marginTop: 20,
    minHeight: 52,
    justifyContent: 'center',
  },
  unsupportedButtonText: {
    color: '#07110B',
    fontSize: 15,
    fontWeight: '900',
  },
});
