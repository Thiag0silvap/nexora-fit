import { LinearGradient } from 'expo-linear-gradient';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  EvaluationComparisonPoint,
  EvaluationMetricKey,
  EvaluationTrend,
  PhysicalEvaluation,
} from '../types';
import { MeasurementRow } from './MeasurementRow';

type EvaluationComparisonModalProps = {
  current: PhysicalEvaluation | null;
  previous: PhysicalEvaluation | null;
  visible: boolean;
  onClose: () => void;
};

const metrics: Array<{
  key: EvaluationMetricKey;
  label: string;
  unit: 'kg' | 'cm';
}> = [
  { key: 'peso', label: 'Peso', unit: 'kg' },
  { key: 'cintura', label: 'Cintura', unit: 'cm' },
  { key: 'abdomen', label: 'Abdômen', unit: 'cm' },
  { key: 'peitoral', label: 'Peitoral', unit: 'cm' },
  { key: 'bracoDireito', label: 'Braço direito', unit: 'cm' },
  { key: 'bracoEsquerdo', label: 'Braço esquerdo', unit: 'cm' },
  { key: 'coxaDireita', label: 'Coxa direita', unit: 'cm' },
  { key: 'coxaEsquerda', label: 'Coxa esquerda', unit: 'cm' },
  { key: 'panturrilhaDireita', label: 'Panturrilha direita', unit: 'cm' },
  { key: 'panturrilhaEsquerda', label: 'Panturrilha esquerda', unit: 'cm' },
];

export function EvaluationComparisonModal({
  current,
  previous,
  visible,
  onClose,
}: EvaluationComparisonModalProps) {
  if (!current) {
    return null;
  }

  const comparisonPoints = buildComparisonPoints(current, previous);

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <LinearGradient colors={['#04060C', '#0C1322', '#101528']} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>Evolução física</Text>
              <Text style={styles.title}>Comparativo</Text>
              <Text style={styles.subtitle}>
                {formatDate(current.createdAt)}
                {previous ? ` vs. ${formatDate(previous.createdAt)}` : ''}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!previous ? (
              <View style={styles.firstEvaluation}>
                <View style={styles.firstDot} />
                <View style={styles.firstCopy}>
                  <Text style={styles.firstTitle}>Primeira avaliação registrada</Text>
                  <Text style={styles.firstText}>
                    Este registro será a base para acompanhar as próximas evoluções.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.legend}>
                <Text style={styles.legendText}>Atual</Text>
                <View style={styles.legendLine} />
                <Text style={styles.legendText}>Avaliacao anterior</Text>
              </View>
            )}

            <View style={styles.measurementsCard}>
              {comparisonPoints.map((point) => (
                <MeasurementRow key={point.key} point={point} />
              ))}
            </View>

            {current.observacao ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteLabel}>Observação da avaliação</Text>
                <Text style={styles.note}>{current.observacao}</Text>
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

export function buildComparisonPoints(
  current: PhysicalEvaluation,
  previous: PhysicalEvaluation | null,
): EvaluationComparisonPoint[] {
  return metrics.map((metric) => {
    const currentValue = getMetricValue(current, metric.key);
    const previousValue = previous ? getMetricValue(previous, metric.key) : null;
    const difference =
      currentValue !== null && previousValue !== null
        ? roundDifference(currentValue - previousValue)
        : null;

    return {
      ...metric,
      currentValue,
      previousValue,
      difference,
      trend: getTrend(difference),
    };
  });
}

function getMetricValue(evaluation: PhysicalEvaluation, key: EvaluationMetricKey) {
  const value =
    key === 'peso' ? evaluation.peso : evaluation.medidasCorporais?.[key];

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

function getTrend(difference: number | null): EvaluationTrend {
  if (difference === null) {
    return 'unavailable';
  }

  if (difference > 0) {
    return 'increased';
  }

  if (difference < 0) {
    return 'decreased';
  }

  return 'equal';
}

function roundDifference(value: number) {
  return Math.round(value * 100) / 100;
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: '#B7FF4A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#8D98AA',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  closeText: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    padding: 20,
    paddingBottom: 38,
  },
  firstEvaluation: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.08)',
    borderColor: 'rgba(183,255,74,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  firstDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  firstCopy: {
    flex: 1,
  },
  firstTitle: {
    color: '#EAFED5',
    fontSize: 14,
    fontWeight: '900',
  },
  firstText: {
    color: '#97A58A',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  legendText: {
    color: '#7F8A9D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  legendLine: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    flex: 1,
    height: 1,
  },
  measurementsCard: {
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderColor: 'rgba(255,255,255,0.11)',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: 18,
    marginTop: 14,
    padding: 14,
  },
  noteLabel: {
    color: '#8E9AAF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  note: {
    color: '#C1CAD8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
});
