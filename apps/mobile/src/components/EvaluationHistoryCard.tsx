import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PhysicalEvaluation } from '../types';

type EvaluationHistoryCardProps = {
  evaluation: PhysicalEvaluation;
  onPress: () => void;
};

export function EvaluationHistoryCard({
  evaluation,
  onPress,
}: EvaluationHistoryCardProps) {
  const measuresCount = countMeasures(evaluation);

  return (
    <Pressable
      accessibilityHint="Abre a comparação com a avaliação anterior"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>Avaliacao</Text>
          <Text style={styles.date}>{formatDate(evaluation.createdAt)}</Text>
        </View>
        <View style={styles.arrowButton}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>

      <View style={styles.weightPanel}>
        <Text style={styles.weightLabel}>Peso</Text>
        <Text style={styles.weight}>{formatWeight(evaluation.peso)}</Text>
      </View>

      {evaluation.observacao ? (
        <View style={styles.notePanel}>
          <Text style={styles.noteLabel}>Observação</Text>
          <Text numberOfLines={3} style={styles.note}>
            {evaluation.observacao}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.measureDot} />
        <Text style={styles.measureCount}>
          {measuresCount} medida{measuresCount === 1 ? '' : 's'} registrada
          {measuresCount === 1 ? '' : 's'}
        </Text>
        <Text style={styles.compareLabel}>Comparar</Text>
      </View>
    </Pressable>
  );
}

function countMeasures(evaluation: PhysicalEvaluation) {
  if (!evaluation.medidasCorporais) {
    return 0;
  }

  const ignoredKeys = new Set(['id', 'avaliacaoFisicaId']);

  return Object.entries(evaluation.medidasCorporais).filter(
    ([key, value]) => !ignoredKeys.has(key) && value !== null && value !== undefined,
  ).length;
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function formatWeight(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })} kg`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.11)',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    opacity: 0.86,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    color: '#7F8A9D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  date: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.11)',
    borderRadius: 13,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  arrow: {
    color: '#B7FF4A',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 28,
  },
  weightPanel: {
    marginTop: 16,
  },
  weightLabel: {
    color: '#9EAABC',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  weight: {
    color: '#DDFEC6',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 4,
  },
  notePanel: {
    backgroundColor: 'rgba(5,8,14,0.45)',
    borderRadius: 14,
    marginTop: 14,
    padding: 11,
  },
  noteLabel: {
    color: '#778296',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  note: {
    color: '#BCC5D3',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
  },
  measureDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 7,
    marginRight: 7,
    width: 7,
  },
  measureCount: {
    color: '#9EAABC',
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  compareLabel: {
    color: '#B7FF4A',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
