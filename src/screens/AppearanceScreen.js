import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppTheme } from "../context/ThemeContext";

const OPTIONS = [
  {
    id: "light",
    title: "Light Mode",
    subtitle: "Keep the app bright all day.",
    icon: "white-balance-sunny",
  },
  {
    id: "dark",
    title: "Dark Mode",
    subtitle: "Use the darker theme all the time.",
    icon: "weather-night",
  },
  {
    id: "adaptive",
    title: "Adaptive",
    subtitle: "Light by day, dark at night.",
    icon: "theme-light-dark",
  },
];

export default function AppearanceScreen({ navigation }) {
  const { colors, themeMode, setThemeMode } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Choose how MoneyMate should look. Adaptive mode switches to dark mode from 7 PM to 7 AM.
        </Text>

        {OPTIONS.map((option) => {
          const selected = themeMode === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setThemeMode(option.id)}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: selected ? colors.primary + "22" : colors.surfaceMuted },
                ]}
              >
                <Icon name={option.icon} size={24} color={selected ? colors.primary : colors.textMuted} />
              </View>

              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                  {option.subtitle}
                </Text>
              </View>

              <Icon
                name={selected ? "check-circle" : "radiobox-blank"}
                size={24}
                color={selected ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
