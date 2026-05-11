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
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useTransactions } from "@/hooks/useTransactions";

export default function TransactionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreate = id === "new";
  const mode = isCreate ? "create" : "edit";

  const { categories } = useCategories();
  const {
    transactions,
    loading: loadingTx,
    crear,
    editar,
    eliminar,
  } = useTransactions();

  const transaccion = isCreate
    ? undefined
    : transactions.find((t) => t.id === id);

  const defaultValues = useMemo(() => {
    return transaccion
      ? {
          amount: transaccion.amount.toString(),
          type: transaccion.type,
          description: transaccion.description,
          categoryId: transaccion.categoryId,
        }
      : undefined;
  }, [transaccion]);

  const form = useTransactionForm({
    mode,
    defaultValues,
    onSubmit: async (data) => {
      if (isCreate) {
        await crear(
          data as {
            amount: number;
            type: "income" | "expense";
            description: string;
            categoryId: string;
          }
        );
      } else {
        await editar(id!, data);
      }
      router.replace("/(tabs)");
    },
  });

  if (!isCreate && loadingTx) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Editar transacción" }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  if (!isCreate && !transaccion) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Editar transacción" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Transacción no encontrada</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.backLink}>Volver al listado</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isCreate && categories.length === 0) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: "Nueva transacción" }} />
        <View style={styles.centered}>
          <Text style={styles.placeholderTitle}>
            Necesitas una categoría primero
          </Text>
          <Text style={styles.placeholderText}>
            Cada transacción se asocia a una categoría. Crea al menos
            una para empezar.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/categories")}
          >
            <Text style={styles.backLink}>Ir a categorías</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleEliminar = () => {
    if (!transaccion) return;
    const ejecutar = async () => {
      await eliminar(id!);
      router.replace("/(tabs)");
    };

    if (Platform.OS === "web") {
      if (window.confirm(`¿Eliminar "${transaccion.description}"?`)) {
        void ejecutar();
      }
      return;
    }

    Alert.alert(
      "Eliminar transacción",
      `¿Seguro que querés eliminar "${transaccion.description}"?`,
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
          title: isCreate ? "Nueva transacción" : "Editar transacción",
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
            {isCreate ? "Nueva transacción" : "Editar transacción"}
          </Text>

          {/* Type toggle */}
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                form.type === "income" && styles.typeButtonActive,
              ]}
              onPress={() => form.setType("income")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  form.type === "income" && styles.typeButtonTextActive,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                form.type === "expense" && styles.typeButtonActive,
              ]}
              onPress={() => form.setType("expense")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  form.type === "expense" && styles.typeButtonTextActive,
                ]}
              >
                Egreso
              </Text>
            </TouchableOpacity>
          </View>
          {form.errores.type ? (
            <Text style={styles.errorLabel}>{form.errores.type}</Text>
          ) : null}

          {/* Amount */}
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={[
              styles.input,
              form.errores.amount ? styles.inputError : null,
            ]}
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={form.amount}
            onChangeText={form.setAmount}
            keyboardType="decimal-pad"
          />
          {form.errores.amount ? (
            <Text style={styles.errorLabel}>{form.errores.amount}</Text>
          ) : null}

          {/* Description */}
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[
              styles.input,
              form.errores.description ? styles.inputError : null,
            ]}
            placeholder="Ej: Café del lunes"
            placeholderTextColor={colors.muted}
            value={form.description}
            onChangeText={form.setDescription}
            autoCapitalize="sentences"
          />
          {form.errores.description ? (
            <Text style={styles.errorLabel}>{form.errores.description}</Text>
          ) : null}

          {/* Category selector */}
          <Text style={styles.label}>Categoría</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyChipsText}>
              No hay categorías disponibles
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {categories.map((cat) => {
                const isSelected = form.categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => form.setCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {form.errores.categoryId ? (
            <Text style={styles.errorLabel}>{form.errores.categoryId}</Text>
          ) : null}

          {/* Submit */}
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
            onPress={() => router.replace("/(tabs)")}
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
  label: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  inputError: { borderColor: colors.danger },
  errorLabel: { fontSize: 12, color: colors.danger, marginTop: 4 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
  typeButtonText: { fontSize: 15, fontWeight: "600", color: colors.text },
  typeButtonTextActive: { color: "#fff" },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
  chipText: { fontSize: 14, color: colors.text },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  emptyChipsText: {
    fontSize: 13,
    color: colors.muted,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: colors.tint,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
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
    marginTop: 8,
  },
  cancelButtonText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  backLink: { fontSize: 16, color: colors.tint, fontWeight: "600" },
  errorText: { fontSize: 18, color: colors.danger, marginBottom: 12 },
});
