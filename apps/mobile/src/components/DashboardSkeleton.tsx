import { StyleSheet, View } from 'react-native';
import { GlassCard } from './GlassCard';

export function DashboardSkeleton() {
  return (
    <View style={styles.stack}>
      <GlassCard style={styles.hero}>
        <View style={styles.lineLarge} />
        <View style={styles.line} />
        <View style={styles.lineShort} />
      </GlassCard>
      <View style={styles.grid}>
        <View style={styles.block} />
        <View style={styles.block} />
      </View>
      <GlassCard style={styles.chart}>
        <View style={styles.lineShort} />
        <View style={styles.chartBody} />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
    marginTop: 20,
  },
  hero: {
    padding: 18,
  },
  lineLarge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    height: 26,
    width: '72%',
  },
  line: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    height: 16,
    marginTop: 16,
    width: '88%',
  },
  lineShort: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    height: 14,
    marginTop: 14,
    width: '42%',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  block: {
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    height: 112,
  },
  chart: {
    padding: 18,
  },
  chartBody: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    height: 150,
    marginTop: 16,
  },
});
