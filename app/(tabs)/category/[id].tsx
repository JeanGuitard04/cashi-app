import { router, useLocalSearchParams } from "expo-router";
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
import { useCategories } from "@/hooks/useCategories";
import { useCategoryForm } from "@/hooks/useCategoryForm";

export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === "new";

  const { crear } = useCategories();

  const form = useCategoryForm({
    mode: "create",
    onSubmit: async (data) => {
      await crear(data as { name: string });
      router.replace("/(tabs)/categories");
    },
  });

  if (!isCreate) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.placeholderTitle}>Edición no disponible</Text>
          <Text style={styles.placeholderText}>
            La edición de categorías esta en construcción.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/categories")}
          >
            <Text style={styles.backLink}>Volver al listado</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Nueva categoría</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              form.errores.name ? styles.inputError : null,
            ]}
            placeholder="Ej: Alimentación"
            placeholderTextColor={colors.muted}
            value={form.name}
            onChangeText={form.setName}
            autoCapitalize="sentences"
          />
          {form.errores.name ? (
            <Text style={styles.errorLabel}>{form.errores.name}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={form.handleSubmit}
            disabled={form.submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {form.submitting ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace("/(tabs)/categories")}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  label: { fontSize: 14, color: colors.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  inputError: { borderColor: colors.danger },
  errorLabel: { fontSize: 12, color: colors.danger, marginBottom: 8 },
  submitButton: {
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: "600" },
});
