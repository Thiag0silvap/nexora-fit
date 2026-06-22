import { StyleSheet, Text, View } from 'react-native';

type BadgeProps = {
  label: string;
  tone?: 'green' | 'purple' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, styles[`${tone}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  green: {
    backgroundColor: 'rgba(183,255,74,0.16)',
  },
  purple: {
    backgroundColor: 'rgba(139,92,246,0.22)',
  },
  neutral: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  greenText: {
    color: '#CFFF79',
  },
  purpleText: {
    color: '#D9CCFF',
  },
  neutralText: {
    color: '#D7DFEA',
  },
});
