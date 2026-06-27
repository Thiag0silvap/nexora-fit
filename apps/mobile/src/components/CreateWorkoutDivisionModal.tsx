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

type CreateWorkoutDivisionValues = {
  nome: string;
};

type CreateWorkoutDivisionModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  nextOrder: number;
  workoutName: string;
  onCancel: () => void;
  onSubmit: (values: CreateWorkoutDivisionValues) => Promise<void>;
};

export function CreateWorkoutDivisionModal({
  visible,
  saving,
  error,
  nextOrder,
  workoutName,
  onCancel,
  onSubmit,
}: CreateWorkoutDivisionModalProps) {
  const [nome, setNome] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNome('');
      setValidationError(null);
    }
  }, [visible]);

  async function handleSubmit() {
    if (nome.trim().length < 2) {
      setValidationError('Informe o nome do treino.');
      return;
    }

    setValidationError(null);
    await onSubmit({ nome: nome.trim() });
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
            <Text style={styles.kicker}>Adicionar treino</Text>
            <Text style={styles.title}>Novo treino da ficha</Text>
            <Text style={styles.subtitle}>
              Este treino sera adicionado dentro de {workoutName}. A ordem sera {nextOrder}.
            </Text>

            <View style={styles.orderPill}>
              <Text style={styles.orderValue}>{nextOrder}</Text>
              <Text style={styles.orderLabel}>Proxima ordem</Text>
            </View>

            <Text style={styles.inputLabel}>Nome do treino/divisao</Text>
            <TextInput
              editable={!saving}
              onChangeText={setNome}
              placeholder="Treino A - Peito e Triceps"
              placeholderTextColor="#647084"
              style={styles.input}
              value={nome}
            />

            <Text style={styles.helperText}>
              Exemplos: Treino B - Costas e Biceps, Treino C - Pernas.
            </Text>

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
                    <Text style={styles.submitText}>Salvar treino</Text>
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
  input: {
    backgroundColor: 'rgba(3,6,12,0.76)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  helperText: {
    color: '#8E9AAF',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
    marginTop: 10,
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
