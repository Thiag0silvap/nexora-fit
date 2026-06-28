import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WorkoutExercise } from '../types';
import { selectionHaptic, warningHaptic } from '../utils/haptics';

type ExecutionFormValues = {
  carga: number;
  repeticoesRealizadas: number;
  observacao?: string;
};

type ExerciseExecutionModalProps = {
  visible: boolean;
  exercise: WorkoutExercise | null;
  saving: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (values: ExecutionFormValues) => Promise<void>;
};

export function ExerciseExecutionModal({
  visible,
  exercise,
  saving,
  error,
  onCancel,
  onSubmit,
}: ExerciseExecutionModalProps) {
  const [carga, setCarga] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [observacao, setObservacao] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCarga('');
      setRepeticoes('');
      setObservacao('');
      setValidationError(null);
    }
  }, [visible, exercise?.id]);

  async function handleSubmit() {
    if (saving) {
      return;
    }

    const normalizedCarga = Number(carga.replace(',', '.'));
    const normalizedReps = Number(repeticoes);

    if (!carga.trim() || Number.isNaN(normalizedCarga)) {
      warningHaptic();
      setValidationError('Informe a carga utilizada.');
      return;
    }

    if (!repeticoes.trim() || !Number.isInteger(normalizedReps)) {
      warningHaptic();
      setValidationError('Informe as repeticoes realizadas.');
      return;
    }

    if (normalizedCarga < 0) {
      warningHaptic();
      setValidationError('A carga nao pode ser negativa.');
      return;
    }

    if (normalizedReps <= 0) {
      warningHaptic();
      setValidationError('As repeticoes precisam ser maiores que zero.');
      return;
    }

    setValidationError(null);

    await onSubmit({
      carga: normalizedCarga,
      repeticoesRealizadas: normalizedReps,
      observacao: observacao.trim() || undefined,
    });
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        style={styles.overlay}
      >
        <Pressable
          style={styles.backdrop}
          onPress={saving ? undefined : () => {
            selectionHaptic();
            onCancel();
          }}
        />
        <LinearGradient colors={['#141B2D', '#070B12']} style={styles.panel}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>KG</Text>
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.kicker}>Registrar carga</Text>
                <Text style={styles.title}>{exercise?.exercicio.nome ?? 'Exercicio'}</Text>
                <Text style={styles.subtitle}>
                  {formatEnum(exercise?.exercicio.grupoMuscular)}
                </Text>
              </View>
            </View>

            <View style={styles.planGrid}>
              <View style={styles.planItem}>
                <Text style={styles.planValue}>{exercise?.series ?? '-'}</Text>
                <Text style={styles.planLabel}>Series</Text>
              </View>
              <View style={styles.planItem}>
                <Text style={styles.planValue}>{exercise?.repeticoes ?? '-'}</Text>
                <Text style={styles.planLabel}>Repeticoes</Text>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carga utilizada</Text>
                <TextInput
                  editable={!saving}
                  keyboardType="decimal-pad"
                  onChangeText={setCarga}
                  placeholder="22"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={carga}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Repeticoes</Text>
                <TextInput
                  editable={!saving}
                  keyboardType="number-pad"
                  onChangeText={setRepeticoes}
                  placeholder="12"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={repeticoes}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observacao opcional</Text>
              <TextInput
                editable={!saving}
                multiline
                onChangeText={setObservacao}
                placeholder="Execucao confortavel"
                placeholderTextColor="#647084"
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={observacao}
              />
            </View>

            {validationError || error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{validationError ?? error}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                disabled={saving}
                onPress={() => {
                  selectionHaptic();
                  onCancel();
                }}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && !saving ? styles.pressedButton : null,
                ]}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={saving}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !saving ? styles.pressedButton : null,
                ]}
              >
                <LinearGradient colors={['#B7FF4A', '#67E76D']} style={styles.submitGradient}>
                  {saving ? (
                    <ActivityIndicator color="#07110B" />
                  ) : (
                    <Text style={styles.submitText}>Concluir exercicio</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatEnum(value?: string | null) {
  if (!value) {
    return '-';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  panel: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  panelContent: {
    padding: 20,
    paddingBottom: 72,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    height: 5,
    marginBottom: 18,
    width: 52,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  iconText: {
    color: '#07110B',
    fontSize: 15,
    fontWeight: '900',
  },
  headerTextWrap: {
    flex: 1,
  },
  kicker: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
  },
  subtitle: {
    color: '#9EAABC',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  planGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  planItem: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  planValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  planLabel: {
    color: '#8E9AAF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 14,
  },
  inputLabel: {
    color: '#DDE6F5',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(3,6,12,0.76)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  textArea: {
    fontSize: 15,
    fontWeight: '700',
    minHeight: 88,
    paddingTop: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.13)',
    borderColor: 'rgba(248,113,113,0.25)',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  submitButton: {
    borderRadius: 18,
    flex: 1.35,
    minHeight: 56,
    overflow: 'hidden',
  },
  submitGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  submitText: {
    color: '#07110B',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
});
