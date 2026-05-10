import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";

export default function CategoriesListScreen() {
  const { categories, loading, error, recargar } = useCategories();

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={recargar}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorías</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No hay categorías todavía</Text>
            <Text style={styles.emptySubtext}>
              Próximamente vas a poder crear desde acá
            </Text>
          </View>
        }
        contentContainerStyle={
          categories.length === 0 ? styles.emptyList : styles.list
        }
      />
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: colors.text },
  list: { paddingHorizontal: 16, paddingTop: 0 },
  emptyList: { flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  errorText: { fontSize: 16, color: colors.danger, marginBottom: 12 },
  retryText: { fontSize: 16, color: colors.tint, fontWeight: "600" },
  emptyText: { fontSize: 18, color: colors.muted, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
