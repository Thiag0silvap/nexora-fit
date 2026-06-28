import {
  Aluno,
  AuthUser,
  CreateAlunoPayload,
  CreateExercicioPayload,
  CreateExercicioDivisaoPayload,
  CreateDivisaoTreinoPayload,
  CreateFichaTreinoPayload,
  CreateInstrutorPayload,
  Exercicio,
  ExercicioDivisao,
  DivisaoTreino,
  DuplicateFichaTreinoPayload,
  FichaTreino,
  Instrutor,
  UpdateAlunoPayload,
  UpdateExercicioPayload,
  UpdateExercicioDivisaoPayload,
  UpdateDivisaoTreinoPayload,
  UpdateInstrutorPayload,
  UserRole,
} from '../types';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}) {
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

  if (!response.ok) {
    throw new Error(data?.message ?? 'Não foi possível conectar ao Nexora Fit.');
  }

  return data as T;
}

export function login(identificador: string, senha: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { identificador, email: identificador, senha },
  });
}

export function getMe(token: string) {
  return request<AuthUser>('/auth/me', { token });
}

export function getAlunos(token: string, status?: 'todos' | 'ativos' | 'inativos') {
  const suffix = status ? `?status=${status}` : '';
  return request<Aluno[]>(`/alunos${suffix}`, { token });
}

export function createAluno(token: string, payload: CreateAlunoPayload) {
  return request<Aluno>('/alunos', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAluno(token: string, alunoId: string, payload: UpdateAlunoPayload) {
  return request<Aluno>(`/alunos/${alunoId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAluno(token: string, alunoId: string) {
  return request<Aluno>(`/alunos/${alunoId}`, {
    method: 'DELETE',
    token,
  });
}

export function findInactiveAlunoByIdentifier(token: string, identificador: string) {
  return request<Aluno | null>(
    `/alunos/inativo?identificador=${encodeURIComponent(identificador)}`,
    { token },
  );
}

export function findInactiveAlunoByEmail(token: string, emailOrIdentifier: string) {
  return findInactiveAlunoByIdentifier(token, emailOrIdentifier);
}

export function reactivateAluno(token: string, alunoId: string, senha: string) {
  return request<Aluno>(`/alunos/${alunoId}/reativar`, {
    method: 'PATCH', token, body: { senha },
  });
}

export function getInstrutores(token: string, status?: 'todos' | 'ativos' | 'inativos') {
  const suffix = status ? `?status=${status}` : '';
  return request<Instrutor[]>(`/instrutores${suffix}`, { token });
}

export function createInstrutor(token: string, payload: CreateInstrutorPayload) {
  return request<Instrutor>('/instrutores', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateInstrutor(
  token: string,
  instrutorId: string,
  payload: UpdateInstrutorPayload,
) {
  return request<Instrutor>(`/instrutores/${instrutorId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteInstrutor(token: string, instrutorId: string) {
  return request<Instrutor>(`/instrutores/${instrutorId}`, {
    method: 'DELETE',
    token,
  });
}

export function findInactiveInstrutorByIdentifier(token: string, identificador: string) {
  return request<Instrutor | null>(
    `/instrutores/inativo?identificador=${encodeURIComponent(identificador)}`,
    { token },
  );
}

export function findInactiveInstrutorByEmail(token: string, emailOrIdentifier: string) {
  return findInactiveInstrutorByIdentifier(token, emailOrIdentifier);
}

export function reactivateInstrutor(token: string, instrutorId: string, senha: string) {
  return request<Instrutor>(`/instrutores/${instrutorId}/reativar`, {
    method: 'PATCH', token, body: { senha },
  });
}

export function getExercicios(token: string) {
  return request<Exercicio[]>('/exercicios', { token });
}

export function createExercicio(token: string, payload: CreateExercicioPayload) {
  return request<Exercicio>('/exercicios', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateExercicio(
  token: string,
  exercicioId: string,
  payload: UpdateExercicioPayload,
) {
  return request<Exercicio>(`/exercicios/${exercicioId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteExercicio(token: string, exercicioId: string) {
  return request<Exercicio>(`/exercicios/${exercicioId}`, {
    method: 'DELETE',
    token,
  });
}

export function getFichasTreino(
  token: string,
  filters: { alunoId?: string; instrutorId?: string; status?: string } = {},
) {
  const query = new URLSearchParams();

  if (filters.alunoId) query.set('alunoId', filters.alunoId);
  if (filters.instrutorId) query.set('instrutorId', filters.instrutorId);
  if (filters.status) query.set('status', filters.status);

  const suffix = query.size ? `?${query.toString()}` : '';
  return request<FichaTreino[]>(`/fichas-treino${suffix}`, { token });
}

export function getFichaTreinoById(token: string, fichaId: string) {
  return request<FichaTreino>(`/fichas-treino/${fichaId}`, { token });
}

export function createFichaTreino(token: string, payload: CreateFichaTreinoPayload) {
  return request<FichaTreino>('/fichas-treino', { method: 'POST', token, body: payload });
}

export function updateFichaTreino(
  token: string,
  fichaId: string,
  payload: { nome?: string; observacao?: string; status?: string },
) {
  return request<FichaTreino>(`/fichas-treino/${fichaId}`, {
    method: 'PATCH', token, body: payload,
  });
}

export function duplicateFichaTreino(
  token: string,
  fichaId: string,
  payload: DuplicateFichaTreinoPayload,
) {
  return request<FichaTreino>(`/fichas-treino/${fichaId}/duplicar`, {
    method: 'POST', token, body: payload,
  });
}

export function createDivisaoTreino(
  token: string,
  fichaId: string,
  payload: CreateDivisaoTreinoPayload,
) {
  return request<DivisaoTreino>(`/fichas-treino/${fichaId}/divisoes`, {
    method: 'POST', token, body: payload,
  });
}

export function updateDivisaoTreino(
  token: string,
  divisaoId: string,
  payload: UpdateDivisaoTreinoPayload,
) {
  return request<DivisaoTreino>(`/divisoes-treino/${divisaoId}`, {
    method: 'PATCH', token, body: payload,
  });
}

export function deleteDivisaoTreino(token: string, divisaoId: string) {
  return request<DivisaoTreino>(`/divisoes-treino/${divisaoId}`, {
    method: 'DELETE', token,
  });
}

export function createExercicioDivisao(
  token: string,
  divisaoId: string,
  payload: CreateExercicioDivisaoPayload,
) {
  return request<ExercicioDivisao>(`/divisoes-treino/${divisaoId}/exercicios`, {
    method: 'POST', token, body: payload,
  });
}

export function updateExercicioDivisao(
  token: string,
  exercicioDivisaoId: string,
  payload: UpdateExercicioDivisaoPayload,
) {
  return request<ExercicioDivisao>(`/exercicios-divisao/${exercicioDivisaoId}`, {
    method: 'PATCH', token, body: payload,
  });
}

export function deleteExercicioDivisao(token: string, exercicioDivisaoId: string) {
  return request<ExercicioDivisao>(`/exercicios-divisao/${exercicioDivisaoId}`, {
    method: 'DELETE', token,
  });
}

export function canAccessAdmin(role?: UserRole) {
  return role === 'ADMIN_ACADEMIA' || role === 'RECEPCAO';
}
