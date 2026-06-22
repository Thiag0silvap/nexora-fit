import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { GlassCard } from '../components/GlassCard';
import { getAlunos } from '../services/api';
import { AuthenticatedUser, InstructorStudent } from '../types';

type InstructorStudentsScreenProps = {
  token: string;
  user: AuthenticatedUser;
  onLogout: () => void;
  onSelectStudent: (student: InstructorStudent) => void;
};

export function InstructorStudentsScreen({
  token,
  user,
  onLogout,
  onSelectStudent,
}: InstructorStudentsScreenProps) {
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const data = await getAlunos(token);
      setStudents(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar os alunos.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [token]);

  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker}>Nexora Fit · Instrutor</Text>
            <Text style={styles.title}>Ola, {getFirstName(user.nome)}</Text>
          </View>
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroLabel}>Area do instrutor</Text>
          <Text style={styles.heroTitle}>Alunos ativos</Text>
          <Text style={styles.heroText}>
            Selecione um aluno para consultar a ficha ativa e revisar o treino.
          </Text>
        </GlassCard>

        {loading ? (
          <StateCard loading title="Carregando alunos" text="Buscando alunos ativos." />
        ) : error ? (
          <StateCard
            title="Nao foi possivel carregar"
            text={error}
            actionLabel="Tentar novamente"
            onAction={loadStudents}
          />
        ) : students.length === 0 ? (
          <StateCard
            title="Nenhum aluno ativo"
            text="Quando houver alunos ativos, eles aparecerao aqui."
            actionLabel="Atualizar"
            onAction={loadStudents}
          />
        ) : (
          students.map((student) => (
            <Pressable key={student.id} onPress={() => onSelectStudent(student)}>
              <GlassCard style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(student.usuario.nome)}</Text>
                  </View>
                  <View style={styles.studentTitleWrap}>
                    <Text style={styles.studentName}>{student.usuario.nome}</Text>
                    <Text style={styles.studentEmail}>{student.usuario.email}</Text>
                  </View>
                  <Badge label="Ver ficha" tone="green" />
                </View>

                <View style={styles.metrics}>
                  <InfoPill label="Objetivo" value={formatEnum(student.objetivo)} />
                  <InfoPill label="Peso atual" value={formatWeight(student.pesoAtual)} />
                </View>
              </GlassCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </LinearGradient>
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

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function getFirstName(name: string) {
  return name.split(' ')[0] || name;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatWeight(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return `${Number(value).toFixed(1)} kg`;
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
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  titleWrap: {
    flex: 1,
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
    fontSize: 32,
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
  heroLabel: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  heroText: {
    color: '#A8B3C4',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarText: {
    color: '#07110B',
    fontSize: 15,
    fontWeight: '900',
  },
  studentTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  studentEmail: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  infoPill: {
    backgroundColor: 'rgba(5,8,14,0.58)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 66,
    padding: 12,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  infoLabel: {
    color: '#8E9AAF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase',
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
