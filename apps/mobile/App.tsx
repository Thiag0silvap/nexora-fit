import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './src/components/GlassCard';
import { InstructorStudentsScreen } from './src/screens/InstructorStudentsScreen';
import { InstructorStudentWorkoutScreen } from './src/screens/InstructorStudentWorkoutScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { WorkoutScreen } from './src/screens/WorkoutScreen';
import {
  createExecucao,
  getExecucoesHoje,
  getLatestExecutionByWorkoutExercise,
  getMyProfile,
  getMyWorkout,
  login,
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

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);
  const [selectedInstructorStudent, setSelectedInstructorStudent] =
    useState<InstructorStudent | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);
  const [latestExecutions, setLatestExecutions] =
    useState<LatestExecutionsByWorkoutExercise>({});

  async function loadLatestExecutions(token: string, workoutData: ActiveWorkout) {
    const exercises = workoutData.divisoes.flatMap(
      (division) => division.exerciciosDivisao,
    );

    const entries = await Promise.all(
      exercises.map(async (exercise) => {
        try {
          const latestExecution = await getLatestExecutionByWorkoutExercise(
            token,
            exercise.id,
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
      const [profileData, workoutData] = await Promise.all([
        getMyProfile(token),
        getMyWorkout(token),
      ]);

      setProfile(profileData);
      setWorkout(workoutData);
      await Promise.all([
        loadLatestExecutions(token, workoutData),
        loadTodayProgress(token, workoutData),
      ]);
    } catch (error) {
      setScreenError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel carregar seu treino.',
      );
      setWorkout(null);
    } finally {
      setScreenLoading(false);
    }
  }

  async function handleLogin(email: string, senha: string) {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await login(email, senha);
      setAccessToken(response.accessToken);
      setAuthenticatedUser(response.user);
      setSelectedInstructorStudent(null);
      setCompletedExercises({});
      setExecutionSuccess(null);

      if (response.user.role === 'ALUNO') {
        await loadStudentData(response.accessToken);
      }
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : 'Email ou senha invalidos.',
      );
      setAccessToken(null);
      setAuthenticatedUser(null);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setAccessToken(null);
    setAuthenticatedUser(null);
    setProfile(null);
    setWorkout(null);
    setSelectedInstructorStudent(null);
    setLoginError(null);
    setScreenError(null);
    setCompletedExercises({});
    setExecutionSuccess(null);
    setLatestExecutions({});
  }

  async function handleRegisterExecution(
    exercise: WorkoutExercise,
    values: Omit<CreateExecutionPayload, 'exercicioDivisaoId'>,
  ) {
    if (!accessToken) {
      throw new Error('Sessao expirada. Entre novamente.');
    }

    const execucao = await createExecucao(accessToken, {
      exercicioDivisaoId: exercise.id,
      ...values,
    });

    setCompletedExercises((current) => ({
      ...current,
      [exercise.id]: true,
    }));
    setLatestExecutions((current) => ({
      ...current,
      [exercise.id]: {
        ultimaCarga: execucao.carga,
        ultimaRepeticao: execucao.repeticoesRealizadas,
        ultimaExecucao: execucao.executadoEm,
        observacao: execucao.observacao,
      },
    }));
    setExecutionSuccess(`${exercise.exercicio.nome} registrado com sucesso.`);
  }

  return (
    <>
      <StatusBar style="light" />
      {accessToken && authenticatedUser?.role === 'ALUNO' ? (
        <WorkoutScreen
          error={screenError}
          loading={screenLoading}
          onLogout={handleLogout}
          onRegisterExecution={handleRegisterExecution}
          onRetry={() => loadStudentData(accessToken)}
          onSuccessDismiss={() => setExecutionSuccess(null)}
          profile={profile}
          completedExercises={completedExercises}
          executionSuccess={executionSuccess}
          latestExecutions={latestExecutions}
          workout={workout}
        />
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
          loading={loginLoading}
          onLogin={handleLogin}
        />
      )}
    </>
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
          <Text style={styles.unsupportedTitle}>Perfil ainda nao disponivel no mobile.</Text>
          <Text style={styles.unsupportedText}>
            O perfil {role} sera liberado em uma proxima versao do aplicativo.
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
