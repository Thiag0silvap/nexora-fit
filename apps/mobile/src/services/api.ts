import {
  ActiveWorkout,
  CreatedDivisionExercise,
  CreateExecutionPayload,
  CreateDivisionExercisePayload,
  CreatePhysicalEvaluationPayload,
  CreateWorkoutDivisionPayload,
  CreateWorkoutPayload,
  CreatedWorkoutDivision,
  DuplicateWorkoutPayload,
  ExecutionRecord,
  Exercise,
  InstructorStudent,
  InstructorWorkout,
  LatestExecution,
  LoginResponse,
  PhysicalEvaluation,
  StudentProfile,
  TodayExecution,
  UpdateDivisionExercisePayload,
  UpdateWorkoutDivisionPayload,
  WorkoutSummary,
} from '../types';

// Em celular fisico, localhost aponta para o proprio celular.
// Ajuste este IP quando o computador mudar de rede.
export const API_BASE_URL = 'https://nexora-fit-api.onrender.com';

type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

let unauthorizedHandler: (() => void) | null = null;
let tokenRefreshHandler: (() => Promise<string | null>) | null = null;

export class UnauthorizedError extends Error {
  constructor() {
    super('Sua sessão expirou. Faça login novamente.');
    this.name = 'UnauthorizedError';
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function setTokenRefreshHandler(handler: (() => Promise<string | null>) | null) {
  tokenRefreshHandler = handler;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.status === 401) {
    if (retryOnUnauthorized && options.token && tokenRefreshHandler) {
      const refreshedToken = await tokenRefreshHandler();

      if (refreshedToken) {
        return request<T>(path, { ...options, token: refreshedToken }, false);
      }
    }

    unauthorizedHandler?.();
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(data?.message ?? 'Nao foi possivel conectar ao Nexora Fit.');
  }

  return data as T;
}

export function login(identificador: string, senha: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { identificador, email: identificador, senha },
  });
}

export function refreshTokens(refreshToken: string) {
  return request<LoginResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      body: { refreshToken },
    },
    false,
  );
}

export function getMyProfile(token: string) {
  return request<StudentProfile>('/mobile/meu-perfil', { token });
}

export function getMyWorkout(token: string) {
  return request<ActiveWorkout>('/mobile/meu-treino', { token });
}

export function getAuthMe(token: string) {
  return request<LoginResponse['user']>('/auth/me', { token });
}

export function createExecucao(token: string, payload: CreateExecutionPayload) {
  return request<ExecutionRecord>('/execucoes', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function getExerciseEvolution(token: string, exercicioId: string) {
  return request<LatestExecution>(
    `/execucoes/exercicio/${exercicioId}/evolucao`,
    { token },
  );
}

export function getLatestExecutionByWorkoutExercise(
  token: string,
  exercicioDivisaoId: string,
) {
  return request<LatestExecution>(
    `/execucoes/exercicio-divisao/${exercicioDivisaoId}/ultima`,
    { token },
  );
}

export function getExecucoesHoje(token: string) {
  return request<TodayExecution[]>('/execucoes/hoje', { token });
}

export function getExecucoesMe(token: string) {
  return request<ExecutionRecord[]>('/execucoes/me', { token });
}

export function getExercicios(token: string) {
  return request<Exercise[]>('/exercicios', { token });
}

export function getAlunos(token: string) {
  return request<InstructorStudent[]>('/alunos', { token });
}

export function getFichasTreinoByAluno(token: string, alunoId: string) {
  return request<WorkoutSummary[]>(`/fichas-treino?alunoId=${alunoId}`, { token });
}

export function getFichaTreinoById(token: string, fichaId: string) {
  return request<InstructorWorkout>(`/fichas-treino/${fichaId}`, { token });
}

export function createAvaliacaoFisica(
  token: string,
  payload: CreatePhysicalEvaluationPayload,
) {
  return request<PhysicalEvaluation>('/avaliacoes-fisicas', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function getAvaliacoesFisicasByAluno(token: string, alunoId: string) {
  return request<PhysicalEvaluation[]>(`/avaliacoes-fisicas/aluno/${alunoId}`, {
    token,
  });
}

export function getUltimaAvaliacaoFisicaByAluno(token: string, alunoId: string) {
  return request<PhysicalEvaluation | null>(
    `/avaliacoes-fisicas/aluno/${alunoId}/ultima`,
    { token },
  );
}

export function createFichaTreino(token: string, payload: CreateWorkoutPayload) {
  return request<InstructorWorkout>('/fichas-treino', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function duplicateFichaTreino(
  token: string,
  fichaTreinoId: string,
  payload: DuplicateWorkoutPayload,
) {
  return request<InstructorWorkout>(`/fichas-treino/${fichaTreinoId}/duplicar`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export function createDivisaoTreino(
  token: string,
  fichaTreinoId: string,
  payload: CreateWorkoutDivisionPayload,
) {
  return request<CreatedWorkoutDivision>(`/fichas-treino/${fichaTreinoId}/divisoes`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export function createExercicioDivisao(
  token: string,
  divisaoTreinoId: string,
  payload: CreateDivisionExercisePayload,
) {
  return request<CreatedDivisionExercise>(`/divisoes-treino/${divisaoTreinoId}/exercicios`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateDivisaoTreino(
  token: string,
  divisaoTreinoId: string,
  payload: UpdateWorkoutDivisionPayload,
) {
  return request<CreatedWorkoutDivision>(`/divisoes-treino/${divisaoTreinoId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteDivisaoTreino(token: string, divisaoTreinoId: string) {
  return request<CreatedWorkoutDivision>(`/divisoes-treino/${divisaoTreinoId}`, {
    method: 'DELETE',
    token,
  });
}

export function updateExercicioDivisao(
  token: string,
  exercicioDivisaoId: string,
  payload: UpdateDivisionExercisePayload,
) {
  return request<CreatedDivisionExercise>(`/exercicios-divisao/${exercicioDivisaoId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteExercicioDivisao(token: string, exercicioDivisaoId: string) {
  return request<CreatedDivisionExercise>(`/exercicios-divisao/${exercicioDivisaoId}`, {
    method: 'DELETE',
    token,
  });
}
