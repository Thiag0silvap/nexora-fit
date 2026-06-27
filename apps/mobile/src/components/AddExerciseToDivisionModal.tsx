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
import { Exercise } from '../types';

type AddExerciseValues = {
  exercicioId: string;
  series: number;
  repeticoes: string;
  descansoSegundos?: number;
  observacao?: string;
};

type AddExerciseToDivisionModalProps = {
  visible: boolean;
  saving: boolean;
  loadingExercises: boolean;
  error?: string | null;
  exercises: Exercise[];
  divisionName: string;
  nextOrder: number;
  onCancel: () => void;
  onReloadExercises: () => void;
  onSubmit: (values: AddExerciseValues) => Promise<void>;
};

export function AddExerciseToDivisionModal({
  visible,
  saving,
  loadingExercises,
  error,
  exercises,
  divisionName,
  nextOrder,
  onCancel,
  onReloadExercises,
  onSubmit,
}: AddExerciseToDivisionModalProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [descansoSegundos, setDescansoSegundos] = useState('');
  const [observacao, setObservacao] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedExerciseId(null);
      setSeries('');
      setRepeticoes('');
      setDescansoSegundos('');
      setObservacao('');
      setValidationError(null);
    }
  }, [visible]);

  async function handleSubmit() {
    const normalizedSeries = Number(series);
    const normalizedRest = descansoSegundos.trim()
      ? Number(descansoSegundos)
      : undefined;

    if (!selectedExerciseId) {
      setValidationError('Selecione um exercicio da biblioteca.');
      return;
    }

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

    setValidationError(null);

    await onSubmit({
      exercicioId: selectedExerciseId,
      series: normalizedSeries,
      repeticoes: repeticoes.trim(),
      descansoSegundos: normalizedRest,
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
        <Pressable style={styles.backdrop} onPress={saving ? undefined : onCancel} />
        <LinearGradient colors={['#141B2D', '#070B12']} style={styles.panel}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handle} />
            <Text style={styles.kicker}>Adicionar exercicio</Text>
            <Text style={styles.title}>{divisionName}</Text>
            <Text style={styles.subtitle}>
              Selecione um exercicio da biblioteca e defina a prescricao. A ordem sera {nextOrder}.
            </Text>

            <View style={styles.orderPill}>
              <Text style={styles.orderValue}>{nextOrder}</Text>
              <Text style={styles.orderLabel}>Proxima ordem</Text>
            </View>

            <Text style={styles.inputLabel}>Biblioteca de exercicios</Text>
            {loadingExercises ? (
              <View style={styles.libraryState}>
                <ActivityIndicator color="#B7FF4A" />
                <Text style={styles.libraryStateText}>Carregando exercicios...</Text>
              </View>
            ) : exercises.length === 0 ? (
              <View style={styles.libraryState}>
                <Text style={styles.libraryStateText}>Nenhum exercicio disponivel.</Text>
                <Pressable onPress={onReloadExercises} style={styles.reloadButton}>
                  <Text style={styles.reloadText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.exerciseList}>
                {exercises.map((exercise) => {
                  const selected = selectedExerciseId === exercise.id;

                  return (
                    <Pressable
                      key={exercise.id}
                      onPress={() => setSelectedExerciseId(exercise.id)}
                      style={[
                        styles.exerciseOption,
                        selected ? styles.exerciseOptionSelected : null,
                      ]}
                    >
                      <View style={styles.exerciseOptionTextWrap}>
                        <Text
                          style={[
                            styles.exerciseOptionTitle,
                            selected ? styles.exerciseOptionTitleSelected : null,
                          ]}
                        >
                          {exercise.nome}
                        </Text>
                        <Text style={styles.exerciseOptionSubtitle}>
                          {formatEnum(exercise.grupoMuscular)}
                        </Text>
                      </View>
                      <View style={selected ? styles.selectedDot : styles.unselectedDot} />
                    </Pressable>
                  );
                })}
              </View>
            )}

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

            <Text style={styles.inputLabel}>Descanso em segundos</Text>
            <TextInput
              editable={!saving}
              keyboardType="number-pad"
              onChangeText={setDescansoSegundos}
              placeholder="60"
              placeholderTextColor="#647084"
              style={styles.input}
              value={descansoSegundos}
            />

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
                    <Text style={styles.submitText}>Salvar exercicio</Text>
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
    maxHeight: '90%',
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
    marginBottom: 14,
    marginTop: 10,
  },
  orderPill: {
    backgroundColor: 'rgba(183,255,74,0.12)',
    borderColor: 'rgba(183,255,74,0.25)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },
  orderValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  orderLabel: {
    color: '#B7FF4A',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  inputLabel: {
    color: '#DDE6F5',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  libraryState: {
    alignItems: 'center',
    backgroundColor: 'rgba(3,6,12,0.54)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
    padding: 16,
  },
  libraryStateText: {
    color: '#B8C2D1',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#B7FF4A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  reloadText: {
    color: '#07110B',
    fontSize: 13,
    fontWeight: '900',
  },
  exerciseList: {
    gap: 8,
    marginBottom: 16,
  },
  exerciseOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(3,6,12,0.54)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    padding: 12,
  },
  exerciseOptionSelected: {
    backgroundColor: 'rgba(183,255,74,0.13)',
    borderColor: 'rgba(183,255,74,0.36)',
  },
  exerciseOptionTextWrap: {
    flex: 1,
  },
  exerciseOptionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  exerciseOptionTitleSelected: {
    color: '#DDFEC6',
  },
  exerciseOptionSubtitle: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  selectedDot: {
    backgroundColor: '#B7FF4A',
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  unselectedDot: {
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    borderWidth: 1,
    height: 14,
    width: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
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
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
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
