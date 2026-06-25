import { StyleSheet, Text, View } from 'react-native';
import { EvaluationTrend } from '../types';

type DifferenceBadgeProps = {
  difference: number | null;
  trend: EvaluationTrend;
  unit: 'kg' | 'cm';
};

const trendContent: Record<EvaluationTrend, { icon: string; label: string }> = {
  increased: { icon: '↑', label: 'Aumentou' },
  decreased: { icon: '↓', label: 'Diminuiu' },
  equal: { icon: '—', label: 'Sem alteração' },
  unavailable: { icon: '—', label: 'Sem comparação' },
};

export function DifferenceBadge({
  difference,
  trend,
  unit,
}: DifferenceBadgeProps) {
  const content = trendContent[trend];

  return (
    <View style={[styles.badge, styles[trend]]}>
      <Text style={[styles.icon, styles[`${trend}Text`]]}>{content.icon}</Text>
      <View>
        <Text style={[styles.value, styles[`${trend}Text`]]}>
          {difference === null ? content.label : formatDifference(difference, unit)}
        </Text>
        {difference !== null ? <Text style={styles.label}>{content.label}</Text> : null}
      </View>
    </View>
  );
}

function formatDifference(value: number, unit: string) {
  const prefix = value > 0 ? '+' : '';

  return `${prefix}${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })} ${unit}`;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  increased: {
    backgroundColor: 'rgba(132,147,171,0.12)',
  },
  decreased: {
    backgroundColor: 'rgba(183,255,74,0.10)',
  },
  equal: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  unavailable: {
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  increasedText: {
    color: '#C4CCDA',
  },
  decreasedText: {
    color: '#DDFEC6',
  },
  equalText: {
    color: '#ABB5C5',
  },
  unavailableText: {
    color: '#818B9B',
  },
  icon: {
    fontSize: 16,
    fontWeight: '900',
  },
  value: {
    fontSize: 11,
    fontWeight: '900',
  },
  label: {
    color: '#7F8999',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
    textTransform: 'uppercase',
  },
});
