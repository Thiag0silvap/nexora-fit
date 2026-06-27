import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

type DashboardShortcutCardProps = {
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
};

export function DashboardShortcutCard({
  title,
  description,
  onPress,
  disabled,
}: DashboardShortcutCardProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <GlassCard style={styles.card}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>›</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.52,
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    padding: 15,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.16)',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconText: {
    color: '#CFFF79',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 27,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    color: '#A8B3C4',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 4,
  },
});
