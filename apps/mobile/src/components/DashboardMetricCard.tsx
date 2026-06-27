import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

type DashboardMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: 'green' | 'purple' | 'neutral';
};

export function DashboardMetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: DashboardMetricCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.accent, styles[tone]]} />
      <Text style={styles.label}>{label}</Text>
      <Text numberOfLines={2} style={styles.value}>
        {value}
      </Text>
      {detail ? (
        <Text numberOfLines={2} style={styles.detail}>
          {detail}
        </Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 126,
    overflow: 'hidden',
    padding: 15,
  },
  accent: {
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 42,
  },
  green: {
    backgroundColor: '#B7FF4A',
  },
  purple: {
    backgroundColor: '#A78BFA',
  },
  neutral: {
    backgroundColor: '#D7DFEA',
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 25,
    marginTop: 8,
  },
  detail: {
    color: '#A8B3C4',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 8,
  },
});
