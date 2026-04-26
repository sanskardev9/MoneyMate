import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Divider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MainScreenWrapper from "../components/MainScreenWrapper";
import { supabase } from "../lib/supabase";
import { formatMonthLabel, getMonthBounds, getMonthKey } from "../lib/monthlyBudget";
import { useAppTheme } from "../context/ThemeContext";
import { useTabShell } from "../context/TabShellContext";
import useCompactLayout from "../hooks/useCompactLayout";

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const buildMonthlySummaries = (expenses, categories) => {
  const monthMap = new Map();

  const ensureMonth = (monthKey) => {
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        monthKey,
        spent: 0,
        entries: 0,
        topCategories: {},
      });
    }

    return monthMap.get(monthKey);
  };

  const categoriesById = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  );

  expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.created_at);
    if (!monthKey) return;

    const current = ensureMonth(monthKey);
    const amount = Number(expense.amount || 0);
    const categoryName = categoriesById[expense.category_id] || "Uncategorized";

    current.spent += amount;
    current.entries += 1;
    current.topCategories[categoryName] =
      (current.topCategories[categoryName] || 0) + amount;
  });

  return [...monthMap.values()]
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .map((month) => ({
      ...month,
      topCategories: Object.entries(month.topCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => ({ name, amount })),
    }));
};

export default function HistoryScreen({ navigation }) {
  const { colors } = useAppTheme();
  const tabShell = useTabShell();
  const isCompact = useCompactLayout();
  const [loading, setLoading] = useState(true);
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [currentIncome, setCurrentIncome] = useState(0);
  const [currentBudget, setCurrentBudget] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const [{ data: expenses }, { data: incomeRows }, { data: categories }] =
          await Promise.all([
            supabase
              .from("expenses")
              .select("id, amount, category_id, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("incomes")
              .select("amount, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("budget_categories")
              .select("id, name, amount, parent_id, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

        const safeExpenses = expenses || [];
        const safeIncomeRows = incomeRows || [];
        const safeCategories = categories || [];

        setCurrentIncome(Number(safeIncomeRows[0]?.amount || 0));
        setCurrentBudget(
          safeCategories
            .filter((category) => !category.parent_id)
            .reduce((sum, category) => sum + Number(category.amount || 0), 0)
        );
        setMonthlySummaries(buildMonthlySummaries(safeExpenses, safeCategories));
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const { startDate } = getMonthBounds();
  const currentMonthKey = getMonthKey(startDate);
  const currentMonthSummary =
    monthlySummaries.find((month) => month.monthKey === currentMonthKey) || {
      monthKey: currentMonthKey,
      spent: 0,
      entries: 0,
      topCategories: [],
    };

  const totals = useMemo(
    () =>
      monthlySummaries.reduce(
        (acc, month) => {
          acc.spent += month.spent;
          acc.entries += month.entries;
          return acc;
        },
        { spent: 0, entries: 0 }
      ),
    [monthlySummaries]
  );

  if (loading) {
    return (
      <MainScreenWrapper navigation={navigation} currentRoute="History">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Preparing history...</Text>
        </View>
      </MainScreenWrapper>
    );
  }

  return (
    <MainScreenWrapper navigation={navigation} currentRoute="History">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: colors.background, paddingBottom: tabShell ? 110 : 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: isCompact ? 24 : 28 }]}>History</Text>
        </View>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surfaceMuted }]}>
            <Card.Content>
              <Icon name="calendar-month" size={22} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Current Month</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{currency(currentMonthSummary.spent)}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.surfaceMuted }]}>
            <Card.Content>
              <Icon name="history" size={22} color={colors.primary} />
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Logged</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{currency(totals.spent)}</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text style={[styles.heroTitle, { color: colors.text, fontSize: isCompact ? 20 : 22 }]}>{formatMonthLabel(currentMonthSummary.monthKey)}</Text>
            <Text style={[styles.heroMeta, { color: colors.textMuted }]}>
              {currentMonthSummary.entries > 0
                ? `${currentMonthSummary.entries} expense entries this month`
                : "Fresh month, fresh logs. Your salary and budget stay ready to use."}
            </Text>

            <View style={styles.metricGrid}>
              <View style={[styles.metricBlock, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Salary</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{currency(currentIncome)}</Text>
              </View>
              <View style={[styles.metricBlock, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Budgeted</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{currency(currentBudget)}</Text>
              </View>
              <View style={[styles.metricBlock, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Spent This Month</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{currency(currentMonthSummary.spent)}</Text>
              </View>
              <View style={[styles.metricBlock, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Remaining This Month</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: colors.text },
                    currentIncome - currentMonthSummary.spent < 0 && { color: colors.danger },
                  ]}
                >
                  {currency(currentIncome - currentMonthSummary.spent)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Archive</Text>

        {monthlySummaries.map((month) => (
          <Pressable
            key={month.monthKey}
            onPress={() =>
              navigation.navigate("ExpenseHistory", {
                monthKey: month.monthKey,
              })
            }
          >
            <Card style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Card.Content>
                <View style={styles.monthHeader}>
                  <View>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>{formatMonthLabel(month.monthKey)}</Text>
                    <Text style={[styles.monthSubtext, { color: colors.textMuted }]}>{month.entries} entries logged</Text>
                  </View>
                  <Text style={[styles.monthSpent, { color: colors.primary }]}>{currency(month.spent)}</Text>
                </View>

                <View style={styles.monthStats}>
                  <Text style={[styles.statText, { color: colors.textMuted }]}>Spent: {currency(month.spent)}</Text>
                  <Text style={[styles.statText, { color: colors.textMuted }]}>Transactions: {month.entries}</Text>
                </View>
                {month.topCategories.length > 0 ? (
                  <>
                    <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.topHeading, { color: colors.text }]}>Top categories</Text>
                    {month.topCategories.map((category) => (
                      <View key={`${month.monthKey}-${category.name}`} style={styles.topRow}>
                        <Text style={[styles.topName, { color: colors.textMuted }]}>{category.name}</Text>
                        <Text style={[styles.topAmount, { color: colors.text }]}>{currency(category.amount)}</Text>
                      </View>
                    ))}
                  </>
                ) : null}
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </MainScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 110,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "300",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B6780",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#F7F3FF",
  },
  summaryLabel: {
    marginTop: 10,
    color: "#6B6780",
    fontSize: 13,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  heroCard: {
    borderRadius: 22,
    backgroundColor: "#1F1B2E",
    marginBottom: 20,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  heroMeta: {
    color: "#C8C1E6",
    marginTop: 6,
    lineHeight: 20,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    gap: 12,
  },
  metricBlock: {
    width: "47%",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#2D2740",
  },
  metricLabel: {
    color: "#C8C1E6",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  negativeValue: {
    color: "#FF8C8C",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 12,
  },
  monthCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEE6FF",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  monthSubtext: {
    marginTop: 2,
    color: "#7A748F",
    fontSize: 13,
  },
  monthSpent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A259FF",
  },
  monthStats: {
    marginTop: 14,
    gap: 6,
  },
  statText: {
    color: "#4E4A62",
    fontSize: 14,
  },
  divider: {
    marginVertical: 14,
    backgroundColor: "#EEE6FF",
  },
  topHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 8,
  },
  tapHint: {
    marginTop: 10,
    color: "#A259FF",
    fontSize: 12,
    fontWeight: "600",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  topName: {
    color: "#4E4A62",
    fontSize: 14,
  },
  topAmount: {
    color: "#1F1B2E",
    fontWeight: "600",
  },
});
