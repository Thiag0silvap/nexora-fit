import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GlassCard } from '../components/GlassCard';

type LoginScreenProps = {
  loading: boolean;
  error?: string | null;
  initialIdentifier?: string;
  rememberUser: boolean;
  onLogin: (identifier: string, senha: string, rememberUser: boolean) => void;
  onRememberUserChange: (rememberUser: boolean) => void;
};

export function LoginScreen({
  loading,
  error,
  initialIdentifier,
  rememberUser,
  onLogin,
  onRememberUserChange,
}: LoginScreenProps) {
  const [identifier, setIdentifier] = useState(initialIdentifier ?? '');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    setIdentifier(initialIdentifier ?? '');
  }, [initialIdentifier]);

  return (
    <LinearGradient colors={['#04060C', '#101426', '#07120E']} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoText}>NF</Text>
              </View>
              <View>
                <Text style={styles.brand}>Nexora Fit</Text>
                <Text style={styles.brandSub}>Aluno</Text>
              </View>
            </View>
            <Text style={styles.title}>Sua evolução, todos os dias.</Text>
            <Text style={styles.subtitle}>
              Seu treino na palma da mao, com ficha ativa, divisoes e execucao
              organizada para cada sessao.
            </Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Acessar conta</Text>
              <Text style={styles.cardHint}>Use o login fornecido pela academia</Text>
            </View>

            <Text style={styles.inputLabel}>Usuário ou e-mail</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              keyboardType="email-address"
              onChangeText={setIdentifier}
              placeholder="usuario ou email"
              placeholderTextColor="#7F8A9A"
              style={styles.input}
              value={identifier}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              editable={!loading}
              onChangeText={setSenha}
              placeholder="Senha"
              placeholderTextColor="#7F8A9A"
              secureTextEntry
              style={styles.input}
              value={senha}
            />

            <Pressable
              disabled={loading}
              onPress={() => onRememberUserChange(!rememberUser)}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, rememberUser ? styles.checkboxChecked : null]}>
                {rememberUser ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Lembrar usuário</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              disabled={loading}
              onPress={() => onLogin(identifier.trim(), senha, rememberUser)}
              style={({ pressed }) => [
                styles.button,
                (pressed || loading) && styles.buttonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#07110B" />
              ) : (
                <Text style={styles.buttonText}>Acessar treino</Text>
              )}
            </Pressable>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowTop: {
    backgroundColor: 'rgba(183,255,74,0.22)',
    borderRadius: 160,
    height: 220,
    position: 'absolute',
    right: -90,
    top: -70,
    width: 220,
  },
  glowBottom: {
    backgroundColor: 'rgba(139,92,246,0.20)',
    borderRadius: 180,
    bottom: -80,
    height: 260,
    left: -120,
    position: 'absolute',
    width: 260,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 28,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#B7FF4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    width: 56,
  },
  logoText: {
    color: '#07110B',
    fontSize: 20,
    fontWeight: '900',
  },
  brand: {
    color: '#EAF3FF',
    fontSize: 19,
    fontWeight: '900',
  },
  brandSub: {
    color: '#8F9DB0',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },
  subtitle: {
    color: '#A8B3C4',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
  },
  card: {
    padding: 20,
  },
  cardHeader: {
    marginBottom: 18,
  },
  cardTitle: {
    color: '#F5F9FF',
    fontSize: 22,
    fontWeight: '900',
  },
  cardHint: {
    color: '#8E9AAF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  inputLabel: {
    color: '#C9D3E3',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(6,10,18,0.72)',
    borderColor: 'rgba(183,255,74,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    color: '#F8FBFF',
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  error: {
    color: '#FF8E8E',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 2,
    paddingVertical: 4,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,10,18,0.72)',
    borderColor: 'rgba(183,255,74,0.28)',
    borderRadius: 8,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: '#B7FF4A',
    borderColor: '#B7FF4A',
  },
  checkboxText: {
    color: '#07110B',
    fontSize: 14,
    fontWeight: '900',
  },
  rememberText: {
    color: '#C9D3E3',
    fontSize: 13,
    fontWeight: '800',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#B7FF4A',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 54,
    shadowColor: '#B7FF4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#07110B',
    fontSize: 16,
    fontWeight: '900',
  },
});
