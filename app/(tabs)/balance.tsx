import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useBalance } from "@/hooks/useBalance";

const COLOR_INCOME = "#16a34a";

const formatAmount = (amount: number) =>
  `$${Math.abs(amount).toLocaleString("es-CL")}`;

export default function BalanceScreen() {
  const { totalIncome, totalExpense, balance, loading, error, recargar } =
    useBalance();

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

  const balancePositive = balance >= 0;
  const balanceSign = balancePositive ? "" : "-";
  const balanceColor = balancePositive ? COLOR_INCOME : colors.danger;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Balance</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo</Text>
        <Text style={[styles.balanceAmount, { color: balanceColor }]}>
          {balanceSign}
          {formatAmount(balance)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={[styles.summaryAmount, { color: COLOR_INCOME }]}>
            +{formatAmount(totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Egresos</Text>
          <Text style={[styles.summaryAmount, { color: colors.danger }]}>
            -{formatAmount(totalExpense)}
          </Text>
        </View>
      </View>
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
  balanceCard: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: colors.muted, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  summaryAmount: { fontSize: 18, fontWeight: "700" },
  errorText: { fontSize: 16, color: colors.danger, marginBottom: 12 },
  retryText: { fontSize: 16, color: colors.tint, fontWeight: "600" },
});
