import { Stack, router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/theme";

export default function TransactionLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            hitSlop={12}
          >
            <Text style={styles.backLabel}>‹ Transacciones</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Transacción",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backLabel: {
    color: colors.tint,
    fontSize: 17,
    paddingHorizontal: 8,
  },
});
