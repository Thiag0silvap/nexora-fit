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
import { BodyMeasures } from '../types';

const measureFields: Array<{ key: keyof BodyMeasures; label: string }> = [
  { key: 'pescoco', label: 'Pescoco' },
  { key: 'ombro', label: 'Ombro' },
  { key: 'peitoral', label: 'Peitoral' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'bracoDireito', label: 'Braco direito' },
  { key: 'bracoEsquerdo', label: 'Braco esquerdo' },
  { key: 'antebracoDireito', label: 'Antebraco direito' },
  { key: 'antebracoEsquerdo', label: 'Antebraco esquerdo' },
  { key: 'coxaDireita', label: 'Coxa direita' },
  { key: 'coxaEsquerda', label: 'Coxa esquerda' },
  { key: 'panturrilhaDireita', label: 'Panturrilha direita' },
  { key: 'panturrilhaEsquerda', label: 'Panturrilha esquerda' },
];

type CreatePhysicalEvaluationValues = {
  peso?: number;
  observacao?: string;
  medidas?: Partial<Record<keyof BodyMeasures, number>>;
};

type CreatePhysicalEvaluationModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  studentName: string;
  onCancel: () => void;
  onSubmit: (values: CreatePhysicalEvaluationValues) => Promise<void>;
};

export function CreatePhysicalEvaluationModal({
  visible,
  saving,
  error,
  studentName,
  onCancel,
  onSubmit,
}: CreatePhysicalEvaluationModalProps) {
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [medidas, setMedidas] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPeso('');
      setObservacao('');
      setMedidas({});
      setValidationError(null);
    }
  }, [visible]);

  function updateMeasure(key: keyof BodyMeasures, value: string) {
    setMedidas((currentMeasures) => ({
      ...currentMeasures,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    const normalizedWeight = normalizeNumber(peso);
    const normalizedMeasures: Partial<Record<keyof BodyMeasures, number>> = {};

    if (peso.trim() && normalizedWeight === undefined) {
      setValidationError('Informe um peso válido.');
      return;
    }

    for (const field of measureFields) {
      const rawValue = medidas[field.key] ?? '';
      const normalizedValue = normalizeNumber(rawValue);

      if (rawValue.trim() && normalizedValue === undefined) {
        setValidationError(`Informe uma medida válida para ${field.label}.`);
        return;
      }

      if (normalizedValue !== undefined) {
        normalizedMeasures[field.key] = normalizedValue;
      }
    }

    setValidationError(null);

    await onSubmit({
      peso: normalizedWeight,
      observacao: observacao.trim() || undefined,
      medidas:
        Object.keys(normalizedMeasures).length > 0 ? normalizedMeasures : undefined,
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
            <Text style={styles.kicker}>Avaliacao fisica</Text>
            <Text style={styles.title}>{studentName}</Text>
            <Text style={styles.subtitle}>
              Registre o peso e as principais medidas corporais do aluno.
            </Text>

            <Text style={styles.inputLabel}>Peso atual</Text>
            <TextInput
              editable={!saving}
              keyboardType="decimal-pad"
              onChangeText={setPeso}
              placeholder="88.25"
              placeholderTextColor="#647084"
              style={styles.input}
              value={peso}
            />

            <Text style={styles.inputLabel}>Observacao opcional</Text>
            <TextInput
              editable={!saving}
              multiline
              onChangeText={setObservacao}
              placeholder="Avaliacao inicial, restricoes ou observacoes"
              placeholderTextColor="#647084"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              value={observacao}
            />

            <Text style={styles.sectionTitle}>Medidas corporais</Text>
            <View style={styles.measureGrid}>
              {measureFields.map((field) => (
                <View key={field.key} style={styles.measureInputWrap}>
                  <Text style={styles.measureLabel}>{field.label}</Text>
                  <TextInput
                    editable={!saving}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => updateMeasure(field.key, value)}
                    placeholder="0"
                    placeholderTextColor="#647084"
                    style={styles.measureInput}
                    value={medidas[field.key] ?? ''}
                  />
                </View>
              ))}
            </View>

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
                    <Text style={styles.submitText}>Salvar avaliação</Text>
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

function normalizeNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const normalizedValue = Number(value.replace(',', '.'));

  if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
    return undefined;
  }

  return normalizedValue;
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 4,
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  measureInputWrap: {
    width: '48%',
  },
  measureLabel: {
    color: '#A8B3C4',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  measureInput: {
    backgroundColor: 'rgba(3,6,12,0.76)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 13,
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
