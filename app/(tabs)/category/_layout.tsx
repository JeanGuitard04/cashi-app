import { Stack, router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/theme";

export default function CategoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <Pressable
            onPress={() => router.replace("/(tabs)/categories")}
            hitSlop={12}
          >
            <Text style={styles.backLabel}>‹ Categorías</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Nueva categoría",
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
