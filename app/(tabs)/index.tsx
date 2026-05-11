import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
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
import { useTransactions } from "@/hooks/useTransactions";

const COLOR_INCOME = "#16a34a";

export default function TransactionsListScreen() {
  const {
    transactions,
    loading: loadingTx,
    error: errorTx,
    recargar,
  } = useTransactions();
  const { categories, loading: loadingCat } = useCategories();

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar])
  );

  const loading = loadingTx || loadingCat;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorTx) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorTx}</Text>
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
        <Text style={styles.headerTitle}>Transacciones</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isIncome = item.type === "income";
          const sign = isIncome ? "+" : "-";
          const amountStyle = isIncome
            ? styles.amountIncome
            : styles.amountExpense;
          const categoryName =
            categoryNameById.get(item.categoryId) ?? "Sin categoría";

          return (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={[styles.amount, amountStyle]}>
                  {sign} ${item.amount.toLocaleString("es-CL")}
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>{categoryName}</Text>
                <Text style={styles.metaSeparator}>·</Text>
                <Text style={styles.metaText}>
                  {new Date(item.date).toLocaleDateString("es-CL")}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No hay transacciones todavía</Text>
            <Text style={styles.emptySubtext}>
              Próximamente vas a poder crear desde acá
            </Text>
          </View>
        }
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyList : styles.list
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  description: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 12,
  },
  amount: { fontSize: 16, fontWeight: "700" },
  amountIncome: { color: COLOR_INCOME },
  amountExpense: { color: colors.danger },
  cardMeta: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: colors.muted },
  metaSeparator: { fontSize: 12, color: colors.muted, marginHorizontal: 6 },
  errorText: { fontSize: 16, color: colors.danger, marginBottom: 12 },
  retryText: { fontSize: 16, color: colors.tint, fontWeight: "600" },
  emptyText: { fontSize: 18, color: colors.muted, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
