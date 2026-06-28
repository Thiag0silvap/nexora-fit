import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runHaptic(action: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await action();
  } catch {
    // Haptics are best-effort; never block the main interaction.
  }
}

export function selectionHaptic() {
  return runHaptic(() => Haptics.selectionAsync());
}

export function lightImpactHaptic() {
  return runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function mediumImpactHaptic() {
  return runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function successHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warningHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
