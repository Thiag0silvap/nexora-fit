import { Pressable, StyleSheet, Text, View } from 'react-native';

type RestTimerProps = {
  durationSeconds?: number | null;
  remainingSeconds?: number;
  status: 'idle' | 'running' | 'finished';
  onStart: () => void;
  onCancel: () => void;
};

export function RestTimer({
  durationSeconds,
  remainingSeconds,
  status,
  onStart,
  onCancel,
}: RestTimerProps) {
  const hasConfiguredRest = Boolean(durationSeconds && durationSeconds > 0);

  if (status === 'running') {
    return (
      <View style={styles.activePanel}>
        <View style={styles.timerCopy}>
          <Text style={styles.activeLabel}>Descanso em andamento</Text>
          <Text style={styles.timerValue}>{formatTime(remainingSeconds ?? 0)}</Text>
        </View>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [styles.cancelButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'finished') {
    return (
      <View style={styles.finishedPanel}>
        <View style={styles.finishedIndicator} />
        <View style={styles.finishedCopy}>
          <Text style={styles.finishedTitle}>Descanso finalizado</Text>
          <Text style={styles.finishedSubtitle}>Pronto para a próxima série.</Text>
        </View>
        <View style={styles.finishedActions}>
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [styles.restartButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.restartText}>Reiniciar</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Limpar cronômetro"
            onPress={onCancel}
            style={({ pressed }) => [styles.clearButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.clearText}>Limpar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      disabled={!hasConfiguredRest}
      onPress={onStart}
      style={({ pressed }) => [
        styles.startButton,
        !hasConfiguredRest ? styles.startButtonDisabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View>
        <Text style={styles.startTitle}>
          {hasConfiguredRest ? 'Iniciar descanso' : 'Descanso não configurado'}
        </Text>
        {hasConfiguredRest ? (
          <Text style={styles.startSubtitle}>{formatTime(durationSeconds ?? 0)}</Text>
        ) : null}
      </View>
      {hasConfiguredRest ? <Text style={styles.startAction}>Iniciar</Text> : null}
    </Pressable>
  );
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  startButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.08)',
    borderColor: 'rgba(183,255,74,0.24)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(255,255,255,0.08)',
    opacity: 0.68,
  },
  startTitle: {
    color: '#EAFED5',
    fontSize: 13,
    fontWeight: '900',
  },
  startSubtitle: {
    color: '#91A17F',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  startAction: {
    color: '#B7FF4A',
    fontSize: 13,
    fontWeight: '900',
  },
  activePanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.12)',
    borderColor: 'rgba(183,255,74,0.36)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 13,
  },
  timerCopy: {
    flex: 1,
  },
  activeLabel: {
    color: '#DDFEC6',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    marginTop: 3,
  },
  cancelButton: {
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  finishedPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,255,74,0.11)',
    borderColor: 'rgba(183,255,74,0.34)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    padding: 12,
  },
  finishedIndicator: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  finishedCopy: {
    flex: 1,
  },
  finishedTitle: {
    color: '#EAFED5',
    fontSize: 13,
    fontWeight: '900',
  },
  finishedSubtitle: {
    color: '#91A17F',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },
  finishedActions: {
    gap: 6,
  },
  restartButton: {
    backgroundColor: '#B7FF4A',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  restartText: {
    color: '#07110B',
    fontSize: 10,
    fontWeight: '900',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 3,
  },
  clearText: {
    color: '#AAB5C5',
    fontSize: 10,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
});
