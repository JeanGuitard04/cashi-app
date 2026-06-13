import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setError("Email y contraseña son obligatorios");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrarte");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={24}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Registrate para empezar a usar Cashi
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Contraseña (mín. 6 caracteres)"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.bottomRow}>
            <Text style={styles.muted}>¿Ya tienes cuenta?</Text>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Iniciar sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: { width: "100%", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  input: {
    width: "85%",
    height: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.tint,
    paddingVertical: 12,
    borderRadius: 8,
    width: "85%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: colors.danger, marginTop: 12, textAlign: "center" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  muted: { color: colors.muted, fontSize: 14 },
  link: { color: colors.tint, fontSize: 14, fontWeight: "600" },
});
