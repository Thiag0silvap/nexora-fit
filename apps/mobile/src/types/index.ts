export type UserRole = 'ADMIN_ACADEMIA' | 'INSTRUTOR' | 'ALUNO' | 'RECEPCAO';

export type User = {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  role: UserRole;
};

export type Academia = {
  id: string;
  nome: string;
  cnpj?: string | null;
  email: string;
  telefone?: string | null;
  ativa: boolean;
};

export type Aluno = {
  id: string;
  matricula: string;
  dataNascimento?: string | null;
  sexo?: string | null;
  altura?: string | number | null;
  pesoAtual?: string | number | null;
  objetivo?: string | null;
  ativo: boolean;
};

export type StudentProfile = {
  usuario: User;
  aluno: Aluno;
  academia: Academia | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User & {
    academiaId: string;
    instrutorId?: string;
  };
};

export type AuthenticatedUser = LoginResponse['user'];

export type Exercise = {
  id: string;
  nome: string;
  grupoMuscular: string;
  descricao?: string | null;
  videoUrl?: string | null;
  ativo: boolean;
};

export type WorkoutExercise = {
  id: string;
  series: number;
  repeticoes: string;
  descansoSegundos?: number | null;
  observacao?: string | null;
  ordem: number;
  exercicio: Exercise;
};

export type WorkoutDivision = {
  id: string;
  nome: string;
  ordem: number;
  exerciciosDivisao: WorkoutExercise[];
};

export type CreatedWorkoutDivision = {
  id: string;
  fichaTreinoId: string;
  nome: string;
  ordem: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ActiveWorkout = {
  id: string;
  nome: string;
  observacao?: string | null;
  status: string;
  aluno: {
    id: string;
    matricula: string;
    objetivo?: string | null;
    altura?: string | number | null;
    pesoAtual?: string | number | null;
    usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
  };
  instrutor: {
    id: string;
    cref?: string | null;
    especialidade?: string | null;
    usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
  };
  divisoes: WorkoutDivision[];
};

export type InstructorStudent = Pick<
  Aluno,
  'id' | 'matricula' | 'objetivo' | 'altura' | 'pesoAtual'
> & {
  usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
};

export type WorkoutSummary = {
  id: string;
  nome: string;
  observacao?: string | null;
  status: string;
  aluno: {
    id: string;
    matricula: string;
    usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
  };
  instrutor: {
    id: string;
    cref?: string | null;
    usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
  };
};

export type InstructorWorkout = WorkoutSummary & {
  divisoes: WorkoutDivision[];
};

export type BodyMeasures = {
  pescoco?: string | number | null;
  ombro?: string | number | null;
  peitoral?: string | number | null;
  cintura?: string | number | null;
  abdomen?: string | number | null;
  quadril?: string | number | null;
  bracoDireito?: string | number | null;
  bracoEsquerdo?: string | number | null;
  antebracoDireito?: string | number | null;
  antebracoEsquerdo?: string | number | null;
  coxaDireita?: string | number | null;
  coxaEsquerda?: string | number | null;
  panturrilhaDireita?: string | number | null;
  panturrilhaEsquerda?: string | number | null;
};

export type PhysicalEvaluation = {
  id: string;
  alunoId: string;
  peso?: string | number | null;
  observacao?: string | null;
  createdAt: string;
  medidasCorporais?: (BodyMeasures & { id: string; avaliacaoFisicaId: string }) | null;
  aluno?: {
    id: string;
    matricula: string;
    usuario: Pick<User, 'id' | 'nome' | 'username' | 'email'>;
  };
};

export type EvaluationMetricKey =
  | 'peso'
  | 'cintura'
  | 'abdomen'
  | 'peitoral'
  | 'bracoDireito'
  | 'bracoEsquerdo'
  | 'coxaDireita'
  | 'coxaEsquerda'
  | 'panturrilhaDireita'
  | 'panturrilhaEsquerda';

export type EvaluationTrend = 'increased' | 'decreased' | 'equal' | 'unavailable';

export type EvaluationComparisonPoint = {
  key: EvaluationMetricKey;
  label: string;
  unit: 'kg' | 'cm';
  currentValue: number | null;
  previousValue: number | null;
  difference: number | null;
  trend: EvaluationTrend;
};

export type CreatePhysicalEvaluationPayload = {
  alunoId: string;
  peso?: number;
  observacao?: string;
  medidas?: Partial<Record<keyof BodyMeasures, number>>;
};

export type CreateWorkoutPayload = {
  alunoId: string;
  instrutorId: string;
  nome: string;
  observacao?: string;
};

export type DuplicateWorkoutPayload = {
  nome: string;
  observacao?: string;
};

export type CreateWorkoutDivisionPayload = {
  nome: string;
  ordem: number;
};

export type UpdateWorkoutDivisionPayload = {
  nome?: string;
  ordem?: number;
};

export type CreateDivisionExercisePayload = {
  exercicioId: string;
  series: number;
  repeticoes: string;
  descansoSegundos?: number;
  observacao?: string;
  ordem: number;
};

export type CreatedDivisionExercise = WorkoutExercise;

export type UpdateDivisionExercisePayload = {
  series?: number;
  repeticoes?: string;
  descansoSegundos?: number;
  observacao?: string;
  ordem?: number;
};

export type CreateExecutionPayload = {
  exercicioDivisaoId: string;
  carga: number;
  repeticoesRealizadas: number;
  observacao?: string;
};

export type ExecutionRecord = {
  id: string;
  alunoId: string;
  exercicioDivisaoId: string;
  carga: string | number;
  repeticoesRealizadas: number;
  observacao?: string | null;
  executadoEm: string;
  createdAt: string;
  updatedAt: string;
};

export type TodayExecution = Pick<
  ExecutionRecord,
  | 'id'
  | 'exercicioDivisaoId'
  | 'carga'
  | 'repeticoesRealizadas'
  | 'observacao'
  | 'executadoEm'
>;

export type LatestExecution = {
  ultimaCarga: string | number;
  ultimaRepeticao: number;
  ultimaExecucao: string;
  observacao?: string | null;
} | null;

export type LatestExecutionsByWorkoutExercise = Record<string, LatestExecution>;
