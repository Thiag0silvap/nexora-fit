export type UserRole = 'ADMIN_ACADEMIA' | 'INSTRUTOR' | 'ALUNO' | 'RECEPCAO';

export type AuthUser = {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  role: UserRole;
  academiaId: string;
  instrutorId?: string;
};

export type TrainingGoal = 'HIPERTROFIA' | 'EMAGRECIMENTO' | 'CONDICIONAMENTO';

export type Sexo = 'MASCULINO' | 'FEMININO' | 'OUTRO';

export type GrupoMuscular =
  | 'PEITO'
  | 'COSTAS'
  | 'OMBRO'
  | 'BICEPS'
  | 'TRICEPS'
  | 'PERNAS'
  | 'GLUTEOS'
  | 'ABDOMEN'
  | 'CARDIO';

export type Aluno = {
  id: string;
  matricula: string;
  objetivo?: TrainingGoal | null;
  altura?: string | number | null;
  pesoAtual?: string | number | null;
  ativo?: boolean;
  usuario: {
    id: string;
    nome: string;
    username: string;
    email: string | null;
  };
};

export type Instrutor = {
  id: string;
  cref?: string | null;
  especialidade?: string | null;
  ativo: boolean;
  usuario: {
    id: string;
    nome: string;
    username: string;
    email: string | null;
    role: UserRole;
  };
};

export type CreateAlunoPayload = {
  nome: string;
  username: string;
  email?: string;
  senha: string;
  matricula?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  altura?: number;
  pesoAtual?: number;
  objetivo?: TrainingGoal;
};

export type UpdateAlunoPayload = {
  nome?: string;
  username?: string;
  email?: string | null;
  altura?: number;
  pesoAtual?: number;
  objetivo?: TrainingGoal;
  ativo?: boolean;
};

export type CreateInstrutorPayload = {
  nome: string;
  username: string;
  email?: string;
  senha: string;
  cref?: string;
  especialidade?: string;
};

export type UpdateInstrutorPayload = {
  nome?: string;
  username?: string;
  email?: string | null;
  cref?: string;
  especialidade?: string;
  ativo?: boolean;
};

export type Exercicio = {
  id: string;
  nome: string;
  grupoMuscular: GrupoMuscular;
  descricao?: string | null;
  videoUrl?: string | null;
  ativo: boolean;
};

export type CreateExercicioPayload = {
  nome: string;
  grupoMuscular: GrupoMuscular;
};

export type UpdateExercicioPayload = {
  nome?: string;
  grupoMuscular?: GrupoMuscular;
  ativo?: boolean;
};

export type StatusFicha = 'ATIVA' | 'INATIVA' | 'ARQUIVADA';

export type ExercicioDivisao = {
  id: string;
  exercicioId: string;
  series: number;
  repeticoes: string;
  descansoSegundos?: number | null;
  observacao?: string | null;
  ordem: number;
  exercicio: Exercicio;
};

export type DivisaoTreino = {
  id: string;
  fichaTreinoId: string;
  nome: string;
  ordem: number;
  exerciciosDivisao: ExercicioDivisao[];
};

export type FichaTreino = {
  id: string;
  nome: string;
  observacao?: string | null;
  status: StatusFicha;
  createdAt: string;
  aluno: Pick<Aluno, 'id' | 'matricula'> & { usuario: Aluno['usuario'] };
  instrutor: Pick<Instrutor, 'id' | 'cref'> & { usuario: Instrutor['usuario'] };
  divisoes?: DivisaoTreino[];
};

export type CreateFichaTreinoPayload = {
  alunoId: string;
  instrutorId: string;
  nome: string;
  observacao?: string;
};

export type DuplicateFichaTreinoPayload = {
  nome: string;
  observacao?: string;
};

export type CreateDivisaoTreinoPayload = {
  nome: string;
  ordem: number;
};

export type UpdateDivisaoTreinoPayload = Partial<CreateDivisaoTreinoPayload>;

export type CreateExercicioDivisaoPayload = {
  exercicioId: string;
  series: number;
  repeticoes: string;
  descansoSegundos?: number;
  observacao?: string;
  ordem: number;
};

export type UpdateExercicioDivisaoPayload = Partial<
  Omit<CreateExercicioDivisaoPayload, 'exercicioId'>
>;
