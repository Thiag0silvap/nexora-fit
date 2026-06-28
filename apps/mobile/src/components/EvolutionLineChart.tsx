import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { DashboardChartPoint } from '../types';

type EvolutionLineChartProps = {
  points: DashboardChartPoint[];
  unit?: string;
  emptyLabel?: string;
};

const chartWidth = Math.min(Dimensions.get('window').width - 72, 340);
const chartHeight = 150;

export function EvolutionLineChart({
  points,
  unit = '',
  emptyLabel = 'Sem dados suficientes',
}: EvolutionLineChartProps) {
  if (points.length < 2) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? 0 : (index / (points.length - 1)) * chartWidth,
    y: chartHeight - ((point.value - min) / range) * (chartHeight - 24) - 12,
    point,
  }));

  return (
    <View style={styles.chartWrap}>
      <View style={[styles.chart, { height: chartHeight, width: chartWidth }]}>
        <View style={[styles.gridLine, { top: 12 }]} />
        <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
        <View style={[styles.gridLine, { bottom: 12 }]} />

        {coordinates.slice(0, -1).map((coordinate, index) => {
          const next = coordinates[index + 1];
          const dx = next.x - coordinate.x;
          const dy = next.y - coordinate.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = `${Math.atan2(dy, dx)}rad`;

          return (
            <View
              key={`${coordinate.point.date}-${next.point.date}`}
              style={[
                styles.segment,
                {
                  left: coordinate.x,
                  top: coordinate.y,
                  transform: [{ rotate: angle }],
                  width: length,
                },
              ]}
            />
          );
        })}

        {coordinates.map((coordinate) => (
          <View
            key={coordinate.point.date}
            style={[
              styles.point,
              {
                left: coordinate.x - 5,
                top: coordinate.y - 5,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.chartLegend}>
        <Text style={styles.legendText}>{points[0].label}</Text>
        <Text style={styles.legendValue}>
          {formatValue(points.at(-1)?.value, unit)}
        </Text>
        <Text style={styles.legendText}>{points.at(-1)?.label}</Text>
      </View>
    </View>
  );
}

function formatValue(value?: number, unit = '') {
  if (value === undefined) return '-';
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${unit}`;
}

const styles = StyleSheet.create({
  chartWrap: {
    marginTop: 16,
  },
  chart: {
    alignSelf: 'center',
    position: 'relative',
  },
  emptyChart: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 138,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  gridLine: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  segment: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 3,
    position: 'absolute',
    shadowColor: '#B7FF4A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    transformOrigin: 'left center',
  },
  point: {
    backgroundColor: '#0C1322',
    borderColor: '#B7FF4A',
    borderRadius: 999,
    borderWidth: 3,
    height: 12,
    position: 'absolute',
    width: 12,
  },
  chartLegend: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  legendValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});
