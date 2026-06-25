import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EvaluationComparisonModal } from '../components/EvaluationComparisonModal';
import { EvaluationHistoryCard } from '../components/EvaluationHistoryCard';
import { GlassCard } from '../components/GlassCard';
import { getAvaliacoesFisicasByAluno } from '../services/api';
import { PhysicalEvaluation } from '../types';

type EvaluationHistoryScreenProps = {
  alunoId: string;
  token: string;
  onBack: () => void;
  onLogout: () => void;
};

export function EvaluationHistoryScreen({
  alunoId,
  token,
  onBack,
  onLogout,
}: EvaluationHistoryScreenProps) {
  const [evaluations, setEvaluations] = useState<PhysicalEvaluation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluations = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getAvaliacoesFisicasByAluno(token, alunoId);
      setEvaluations(
        [...data].sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar suas avaliações.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [alunoId, token]);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const selectedEvaluation =
    selectedIndex === null ? null : evaluations[selectedIndex] ?? null;
  const previousEvaluation =
    selectedIndex === null ? null : evaluations[selectedIndex + 1] ?? null;

  return (
    <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <FlatList
        ListEmptyComponent={
          loading ? (
            <StateCard
              loading
              text="Organizando seus registros de evolução."
              title="Carregando avaliações"
            />
          ) : error ? (
            <StateCard
              actionLabel="Tentar novamente"
              onAction={() => loadEvaluations()}
              text={error}
              title="Não foi possível carregar"
            />
          ) : (
            <StateCard
              text="Quando seu instrutor registrar uma avaliação física, ela aparecerá aqui."
              title="Sua evolução começa no primeiro registro"
            />
          )
        }
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Pressable onPress={onBack} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </Pressable>
              <Pressable onPress={onLogout} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sair</Text>
              </Pressable>
            </View>

            <View style={styles.heading}>
              <Text style={styles.kicker}>Nexora Fit</Text>
              <Text style={styles.title}>Histórico de avaliações</Text>
              <Text style={styles.subtitle}>
                Acompanhe peso e medidas em cada etapa da sua evolução.
              </Text>
            </View>

            {!loading && !error && evaluations.length > 0 ? (
              <GlassCard style={styles.summaryCard}>
                <View style={styles.summaryAccent} />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryLabel}>Jornada registrada</Text>
                  <Text style={styles.summaryValue}>
                    {evaluations.length} avaliação{evaluations.length === 1 ? '' : 'ões'}
                  </Text>
                  <Text style={styles.summaryText}>
                    Toque em um registro para comparar com a avaliação anterior.
                  </Text>
                </View>
              </GlassCard>
            ) : null}
          </>
        }
        contentContainerStyle={[
          styles.content,
          evaluations.length === 0 ? styles.emptyContent : null,
        ]}
        data={evaluations}
        keyExtractor={(evaluation) => evaluation.id}
        refreshControl={
          <RefreshControl
            colors={['#B7FF4A']}
            onRefresh={() => loadEvaluations(true)}
            progressBackgroundColor="#101528"
            refreshing={refreshing}
            tintColor="#B7FF4A"
          />
        }
        renderItem={({ item, index }) => (
          <EvaluationHistoryCard
            evaluation={item}
            onPress={() => setSelectedIndex(index)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <EvaluationComparisonModal
        current={selectedEvaluation}
        onClose={() => setSelectedIndex(null)}
        previous={previousEvaluation}
        visible={selectedIndex !== null}
      />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    bottom: 80,
    height: 300,
    left: -170,
    position: 'absolute',
    width: 300,
  },
  content: {
    padding: 20,
    paddingBottom: 42,
    paddingTop: 56,
  },
  emptyContent: {
    flexGrow: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  heading: {
    marginBottom: 20,
    marginTop: 24,
  },
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
    marginTop: 6,
  },
  subtitle: {
    color: '#9EAABC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 330,
  },
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    marginBottom: 16,
    padding: 16,
  },
  summaryAccent: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 52,
    width: 5,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    color: '#8E9AAF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryText: {
    color: '#8E9AAF',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  stateCard: {
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: 24,
  },
  stateDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  stateTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  stateText: {
    color: '#A8B3C4',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#B7FF4A',
    borderRadius: 14,
    marginTop: 2,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  retryText: {
    color: '#07110B',
    fontSize: 12,
    fontWeight: '900',
  },
});
