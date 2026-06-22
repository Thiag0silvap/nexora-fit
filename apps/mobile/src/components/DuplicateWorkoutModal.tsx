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

type DuplicateWorkoutValues = {
  nome: string;
  observacao?: string;
};

type DuplicateWorkoutModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  workoutName: string;
  onCancel: () => void;
  onSubmit: (values: DuplicateWorkoutValues) => Promise<void>;
};

export function DuplicateWorkoutModal({
  visible,
  saving,
  error,
  workoutName,
  onCancel,
  onSubmit,
}: DuplicateWorkoutModalProps) {
  const [nome, setNome] = useState('');
  const [observacao, setObservacao] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNome(`Cópia de ${workoutName}`);
      setObservacao('');
      setValidationError(null);
    }
  }, [visible, workoutName]);

  async function handleSubmit() {
    if (nome.trim().length < 2) {
      setValidationError('Informe um nome para a nova ficha.');
      return;
    }

    setValidationError(null);

    await onSubmit({
      nome: nome.trim(),
      observacao: observacao.trim() || undefined,
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
            <Text style={styles.kicker}>Duplicar ficha</Text>
            <Text style={styles.title}>{workoutName}</Text>
            <Text style={styles.subtitle}>
              A copia sera criada como ficha ativa, mantendo treinos e exercicios. Historico de
              cargas nao sera copiado.
            </Text>

            <Text style={styles.inputLabel}>Nome da nova ficha</Text>
            <TextInput
              editable={!saving}
              onChangeText={setNome}
              placeholder="Ficha Hipertrofia - Julho"
              placeholderTextColor="#647084"
              style={styles.input}
              value={nome}
            />

            <Text style={styles.inputLabel}>Observacao opcional</Text>
            <TextInput
              editable={!saving}
              multiline
              onChangeText={setObservacao}
              placeholder="Ficha duplicada e ajustada para novo ciclo"
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
                    <Text style={styles.submitText}>Duplicar ficha</Text>
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
    paddingBottom: 34,
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
    marginBottom: 18,
    marginTop: 10,
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
