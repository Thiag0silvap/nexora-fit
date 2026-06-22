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

type EditExerciseDivisionValues = {
  series: number;
  repeticoes: string;
  descansoSegundos?: number;
  observacao?: string;
  ordem: number;
};

type EditExerciseDivisionModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  exercise: WorkoutExercise | null;
  onCancel: () => void;
  onSubmit: (values: EditExerciseDivisionValues) => Promise<void>;
};

export function EditExerciseDivisionModal({
  visible,
  saving,
  error,
  exercise,
  onCancel,
  onSubmit,
}: EditExerciseDivisionModalProps) {
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [descansoSegundos, setDescansoSegundos] = useState('');
  const [observacao, setObservacao] = useState('');
  const [ordem, setOrdem] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && exercise) {
      setSeries(String(exercise.series));
      setRepeticoes(exercise.repeticoes);
      setDescansoSegundos(
        exercise.descansoSegundos === undefined || exercise.descansoSegundos === null
          ? ''
          : String(exercise.descansoSegundos),
      );
      setObservacao(exercise.observacao ?? '');
      setOrdem(String(exercise.ordem));
      setValidationError(null);
    }
  }, [visible, exercise]);

  async function handleSubmit() {
    const normalizedSeries = Number(series);
    const normalizedRest = descansoSegundos.trim()
      ? Number(descansoSegundos)
      : undefined;
    const normalizedOrder = Number(ordem);

    if (!series.trim() || !Number.isInteger(normalizedSeries) || normalizedSeries <= 0) {
      setValidationError('Informe uma quantidade valida de series.');
      return;
    }

    if (!repeticoes.trim()) {
      setValidationError('Informe as repeticoes.');
      return;
    }

    if (
      normalizedRest !== undefined &&
      (!Number.isInteger(normalizedRest) || normalizedRest < 0)
    ) {
      setValidationError('Informe um descanso valido em segundos.');
      return;
    }

    if (!ordem.trim() || !Number.isInteger(normalizedOrder) || normalizedOrder <= 0) {
      setValidationError('Informe uma ordem valida.');
      return;
    }

    setValidationError(null);
    await onSubmit({
      series: normalizedSeries,
      repeticoes: repeticoes.trim(),
      descansoSegundos: normalizedRest,
      observacao: observacao.trim() || undefined,
      ordem: normalizedOrder,
    });
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={saving ? undefined : onCancel} />
        <LinearGradient colors={['#141B2D', '#070B12']} style={styles.panel}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handle} />
            <Text style={styles.kicker}>Editar exercicio</Text>
            <Text style={styles.title}>{exercise?.exercicio.nome ?? 'Exercicio'}</Text>
            <Text style={styles.subtitle}>
              Ajuste a prescricao do exercicio dentro deste treino.
            </Text>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Series</Text>
                <TextInput
                  editable={!saving}
                  keyboardType="number-pad"
                  onChangeText={setSeries}
                  placeholder="3"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={series}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Repeticoes</Text>
                <TextInput
                  editable={!saving}
                  onChangeText={setRepeticoes}
                  placeholder="12"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={repeticoes}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descanso</Text>
                <TextInput
                  editable={!saving}
                  keyboardType="number-pad"
                  onChangeText={setDescansoSegundos}
                  placeholder="60"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={descansoSegundos}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ordem</Text>
                <TextInput
                  editable={!saving}
                  keyboardType="number-pad"
                  onChangeText={setOrdem}
                  placeholder="1"
                  placeholderTextColor="#647084"
                  style={styles.input}
                  value={ordem}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Observacao opcional</Text>
            <TextInput
              editable={!saving}
              multiline
              onChangeText={setObservacao}
              placeholder="Executar com controle"
              placeholderTextColor="#647084"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              value={observacao}
            />

            {validationError || error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{validationError ?? error}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable disabled={saving} onPress={onCancel} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable disabled={saving} onPress={handleSubmit} style={styles.submitButton}>
                <LinearGradient colors={['#B7FF4A', '#67E76D']} style={styles.submitGradient}>
                  {saving ? (
                    <ActivityIndicator color="#07110B" />
                  ) : (
                    <Text style={styles.submitText}>Salvar</Text>
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

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)' },
  panel: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  panelContent: { padding: 20, paddingBottom: 34 },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    height: 5,
    marginBottom: 18,
    width: 52,
  },
  kicker: {
    color: '#B7FF4A',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subtitle: {
    color: '#A8B3C4',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
    marginTop: 10,
  },
  formRow: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
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
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  textArea: {
    fontSize: 15,
    fontWeight: '700',
    minHeight: 94,
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
  errorText: { color: '#FCA5A5', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10 },
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
  cancelText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  submitButton: { borderRadius: 18, flex: 1.35, minHeight: 56, overflow: 'hidden' },
  submitGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  submitText: { color: '#07110B', fontSize: 14, fontWeight: '900' },
});
