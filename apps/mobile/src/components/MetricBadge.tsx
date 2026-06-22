import { StyleSheet, Text, View } from 'react-native';

type MetricBadgeProps = {
  label: string;
  value: string;
};

export function MetricBadge({ label, value }: MetricBadgeProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    color: '#8E9AAF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
