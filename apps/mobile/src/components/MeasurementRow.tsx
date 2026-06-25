import { StyleSheet, Text, View } from 'react-native';
import { EvaluationComparisonPoint } from '../types';
import { DifferenceBadge } from './DifferenceBadge';

type MeasurementRowProps = {
  point: EvaluationComparisonPoint;
};

export function MeasurementRow({ point }: MeasurementRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleArea}>
        <Text style={styles.label}>{point.label}</Text>
        <View style={styles.values}>
          <Text style={styles.current}>{formatValue(point.currentValue, point.unit)}</Text>
          <Text style={styles.separator}>anterior</Text>
          <Text style={styles.previous}>{formatValue(point.previousValue, point.unit)}</Text>
        </View>
      </View>
      <DifferenceBadge
        difference={point.difference}
        trend={point.trend}
        unit={point.unit}
      />
    </View>
  );
}

function formatValue(value: number | null, unit: string) {
  if (value === null) {
    return '-';
  }

  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })} ${unit}`;
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingVertical: 12,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: '#9EAABC',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  values: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 7,
  },
  current: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  separator: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previous: {
    color: '#AAB4C4',
    fontSize: 12,
    fontWeight: '800',
  },
});
