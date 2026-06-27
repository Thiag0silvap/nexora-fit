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
import { WorkoutDivision } from '../types';

type EditWorkoutDivisionValues = {
  nome: string;
  ordem: number;
};

type EditWorkoutDivisionModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  division: WorkoutDivision | null;
  onCancel: () => void;
  onSubmit: (values: EditWorkoutDivisionValues) => Promise<void>;
};

export function EditWorkoutDivisionModal({
  visible,
  saving,
  error,
  division,
  onCancel,
  onSubmit,
}: EditWorkoutDivisionModalProps) {
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && division) {
      setNome(division.nome);
      setOrdem(String(division.ordem));
      setValidationError(null);
    }
  }, [visible, division]);

  async function handleSubmit() {
    const normalizedOrder = Number(ordem);

    if (nome.trim().length < 2) {
      setValidationError('Informe o nome do treino.');
      return;
    }

    if (!ordem.trim() || !Number.isInteger(normalizedOrder) || normalizedOrder <= 0) {
      setValidationError('Informe uma ordem valida.');
      return;
    }

    setValidationError(null);
    await onSubmit({ nome: nome.trim(), ordem: normalizedOrder });
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
            <Text style={styles.kicker}>Editar treino</Text>
            <Text style={styles.title}>{division?.nome ?? 'Treino'}</Text>

            <Text style={styles.inputLabel}>Nome do treino</Text>
            <TextInput
              editable={!saving}
              onChangeText={setNome}
              placeholder="Treino A - Peito e Triceps"
              placeholderTextColor="#647084"
              style={styles.input}
              value={nome}
            />

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
    maxHeight: '88%',
    overflow: 'hidden',
  },
  panelContent: { padding: 20, paddingBottom: 72 },
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
    marginBottom: 18,
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
