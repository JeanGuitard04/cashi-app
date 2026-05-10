import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const mode = isCreate ? "create" : "edit";

  const { categories, loading, crear, editar, eliminar } = useCategories();
  const categoria = isCreate
    ? undefined
    : categories.find((c) => c.id === id);

  const defaultValues = useMemo(() => {
    return categoria ? { name: categoria.name } : undefined;
  }, [categoria]);

  const form = useCategoryForm({
    mode,
    defaultValues,
    onSubmit: async (data) => {
      if (isCreate) {
        await crear(data as { name: string });
      } else {
        await editar(id!, data);
      }
      router.replace("/(tabs)/categories");
    },
  });

  if (!isCreate && loading) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Editar categoría" }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  if (!isCreate && !categoria) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Editar categoría" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Categoría no encontrada</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/categories")}
          >
            <Text style={styles.backLink}>Volver al listado</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleEliminar = () => {
    if (!categoria) return;
    const ejecutar = async () => {
      await eliminar(id!);
      router.replace("/(tabs)/categories");
    };

    if (Platform.OS === "web") {
      if (window.confirm(`¿Eliminar "${categoria.name}"?`)) {
        void ejecutar();
      }
      return;
    }

    Alert.alert(
      "Eliminar categoría",
      `¿Seguro que querés eliminar "${categoria.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: ejecutar },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: isCreate ? "Nueva categoría" : "Editar categoría",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {isCreate ? "Nueva categoría" : "Editar categoría"}
          </Text>

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

          {!isCreate ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleEliminar}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          ) : null}

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
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 18, color: colors.danger, marginBottom: 12 },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: "600" },
});
