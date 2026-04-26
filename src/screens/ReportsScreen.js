import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MainScreenWrapper from "../components/MainScreenWrapper";
import { supabase } from "../lib/supabase";
import { formatMonthLabel, getMonthBounds, getMonthKey } from "../lib/monthlyBudget";
import { useAppTheme } from "../context/ThemeContext";
import { useTabShell } from "../context/TabShellContext";
import useCompactLayout from "../hooks/useCompactLayout";

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#A259FF", "#FF8A65", "#4DB6AC", "#FFD166", "#5C7CFA", "#EF476F"];

const summarizeCategorySpend = (expenses, categories, monthKey) => {
  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  const totals = {};

  expenses.forEach((expense) => {
    if (getMonthKey(expense.created_at) !== monthKey) return;
    const name = categoryMap[expense.category_id] || "Uncategorized";
    totals[name] = (totals[name] || 0) + Number(expense.amount || 0);
  });

  const ranked = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount }));

  if (ranked.length <= 4) return ranked;

  const top = ranked.slice(0, 4);
  const other = ranked.slice(4).reduce((sum, item) => sum + item.amount, 0);
  return [...top, { name: "Other", amount: other }];
};

const summarizeWeekdaySpend = (expenses, monthKey) => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = [0, 0, 0, 0, 0, 0, 0];

  expenses.forEach((expense) => {
    if (getMonthKey(expense.created_at) !== monthKey) return;
    const date = new Date(expense.created_at);
    const index = (date.getDay() + 6) % 7;
    totals[index] += Number(expense.amount || 0);
  });

  return labels
    .map((name, index) => ({ name, amount: totals[index] }))
    .filter((item) => item.amount > 0);
};

const buildSegments = (items) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (!total) return [];

  let cumulative = 0;
  return items.map((item, index) => {
    const fraction = item.amount / total;
    const segment = {
      ...item,
      fraction,
      startFraction: cumulative,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
    cumulative += fraction;
    return segment;
  });
};

const DonutChart = ({ items, centerPrimary, centerSecondary, trackColor, primaryTextColor, secondaryTextColor, compact = false }) => {
  const size = compact ? 140 : 168;
  const strokeWidth = compact ? 18 : 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segments = buildSegments(items);

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment) => {
          const dash = segment.fraction * circumference;
          const gap = circumference - dash;
          return (
            <Circle
              key={segment.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${segment.startFraction * 360 - 90} ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={[styles.donutPrimary, { color: primaryTextColor }]}>{centerPrimary}</Text>
        <Text style={[styles.donutSecondary, { color: secondaryTextColor }]}>{centerSecondary}</Text>
      </View>
    </View>
  );
};

const Legend = ({ items, textColor, valueColor }) => (
  <View style={styles.legendList}>
    {items.map((item, index) => (
      <View key={item.name} style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }]} />
        <Text style={[styles.legendName, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.legendValue, { color: valueColor }]}>{currency(item.amount)}</Text>
      </View>
    ))}
  </View>
);

export default function ReportsScreen({ navigation }) {
  const { colors } = useAppTheme();
  const tabShell = useTabShell();
  const isCompact = useCompactLayout();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [income, setIncome] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(getMonthBounds().startDate);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const [{ data: expenseRows }, { data: categoryRows }, { data: incomeRows }] =
          await Promise.all([
            supabase
              .from("expenses")
              .select("amount, category_id, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("budget_categories")
              .select("id, name")
              .eq("user_id", user.id),
            supabase
              .from("incomes")
              .select("amount")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1),
          ]);

        setExpenses(expenseRows || []);
        setCategories(categoryRows || []);
        setIncome(Number(incomeRows?.[0]?.amount || 0));
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const selectedMonthKey = getMonthKey(selectedMonth);
  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => getMonthKey(expense.created_at) === selectedMonthKey),
    [expenses, selectedMonthKey]
  );
  const monthTotal = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const averageSpend = monthlyExpenses.length ? monthTotal / monthlyExpenses.length : 0;
  const categorySplit = useMemo(
    () => summarizeCategorySpend(expenses, categories, selectedMonthKey),
    [expenses, categories, selectedMonthKey]
  );
  const weekdaySplit = useMemo(
    () => summarizeWeekdaySpend(expenses, selectedMonthKey),
    [expenses, selectedMonthKey]
  );
  const spendVsLeft = [
    { name: "Spent", amount: monthTotal },
    { name: "Left", amount: Math.max(income - monthTotal, 0) },
  ].filter((item) => item.amount > 0);

  const availableMonthKeys = [...new Set(expenses.map((expense) => getMonthKey(expense.created_at)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));
  const currentMonthStart = getMonthBounds().startDate;
  const currentYear = currentMonthStart.getFullYear();
  const availableYears = [...new Set([currentYear, ...availableMonthKeys.map((key) => Number(key.split("-")[0]))])]
    .sort((a, b) => b - a);
  const selectedYear = selectedMonth.getFullYear();

  const selectYear = (year) => {
    const targetMonth =
      year === currentYear
        ? Math.min(selectedMonth.getMonth(), currentMonthStart.getMonth())
        : selectedMonth.getMonth();
    setSelectedMonth(new Date(year, targetMonth, 1));
  };

  const selectMonth = (monthIndex) => {
    if (selectedYear === currentYear && monthIndex > currentMonthStart.getMonth()) return;
    setSelectedMonth(new Date(selectedYear, monthIndex, 1));
    setShowMonthSelector(false);
  };

  const topCategory = categorySplit[0]?.name || "None";
  const isCurrentMonthSelected =
    selectedMonth.getFullYear() === currentMonthStart.getFullYear() &&
    selectedMonth.getMonth() === currentMonthStart.getMonth();

  if (loading) {
    return (
      <MainScreenWrapper navigation={navigation} currentRoute="Reports">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading reports...</Text>
        </View>
      </MainScreenWrapper>
    );
  }

  return (
    <MainScreenWrapper navigation={navigation} currentRoute="Reports">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: colors.background, paddingBottom: tabShell ? 110 : 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: isCompact ? 24 : 28 }]}>{`Reports`}</Text>
        </View>

        <Pressable
          style={[styles.monthPickerButton, { backgroundColor: colors.surfaceMuted }]}
          onPress={() => setShowMonthSelector((prev) => !prev)}
        >
          <View style={styles.monthCenter}>
            <Text style={[styles.monthPickerLabel, { color: colors.textMuted }]}>Selected month</Text>
            <Text style={[styles.monthPickerValue, { color: colors.text, fontSize: isCompact ? 16 : 18 }]}>{formatMonthLabel(selectedMonthKey)}</Text>
            <Text style={[styles.monthHint, { color: colors.textMuted }]}>
              {availableMonthKeys.includes(selectedMonthKey)
                ? `Showing transactions from ${formatMonthLabel(selectedMonthKey)} `
                : "No data stored for this month yet"}
            </Text>
          </View>
          <View style={styles.monthPickerActions}>
            {!isCurrentMonthSelected ? (
              <Pressable
                hitSlop={10}
                style={[styles.inlineResetButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedMonth(currentMonthStart);
                  setShowMonthSelector(false);
                }}
              >
                <Icon name="calendar-refresh" size={16} color={colors.primary} />
              </Pressable>
            ) : null}
            <Icon
              name={showMonthSelector ? "chevron-up" : "chevron-down"}
              size={22}
              color={colors.primary}
            />
          </View>
        </Pressable>

        {showMonthSelector ? (
          <View style={[styles.selectorPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.selectorBlock}>
              <Text style={[styles.selectorTitle, { color: colors.text }]}>Year</Text>
              <View style={styles.yearRow}>
                {availableYears.map((year) => {
                  const active = year === selectedYear;
                  return (
                    <Pressable
                      key={year}
                      onPress={() => selectYear(year)}
                      style={[
                        styles.yearChip,
                        { backgroundColor: colors.surfaceMuted },
                        active && { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.yearChipText,
                          { color: colors.textMuted },
                          active && { color: "#FFFFFF" },
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.selectorBlock}>
              <Text style={[styles.selectorTitle, { color: colors.text }]}>Month</Text>
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((label, index) => {
                  const active = index === selectedMonth.getMonth();
                  const disabled = selectedYear === currentYear && index > currentMonthStart.getMonth();
                  return (
                    <Pressable
                      key={label}
                      onPress={() => !disabled && selectMonth(index)}
                      style={[
                        styles.monthChip,
                        { backgroundColor: colors.surfaceMuted },
                        active && { backgroundColor: colors.primary },
                        disabled && { backgroundColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          { color: colors.textMuted },
                          active && { color: "#FFFFFF" },
                          disabled && { color: colors.textMuted },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Month Spend</Text>
              <Text style={styles.summaryValue}>{currency(monthTotal)}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Transactions</Text>
              <Text style={styles.summaryValue}>{monthlyExpenses.length}</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCardLight, { backgroundColor: colors.surfaceMuted }]}>
            <Card.Content>
              <Text style={[styles.summaryLabelLight, { color: colors.textMuted }]}>Average Spend</Text>
              <Text style={[styles.summaryValueLight, { color: colors.text }]}>{currency(averageSpend)}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCardLight, { backgroundColor: colors.surfaceMuted }]}>
            <Card.Content>
              <Text style={[styles.summaryLabelLight, { color: colors.textMuted }]}>Top Category</Text>
              <Text style={[styles.summaryValueLight, { color: colors.text }]} numberOfLines={1}>
                {topCategory}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Card.Content>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Category Spend Split</Text>
            <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
              Where the money went in {formatMonthLabel(selectedMonthKey)}.
            </Text>
            {categorySplit.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No spending logged for this month yet.</Text>
            ) : (
              <>
                <DonutChart
                  items={categorySplit}
                  centerPrimary={currency(monthTotal)}
                  centerSecondary="Total spent"
                  trackColor={colors.border}
                  primaryTextColor={colors.text}
                  secondaryTextColor={colors.textMuted}
                  compact={isCompact}
                />
                <Legend items={categorySplit} textColor={colors.textMuted} valueColor={colors.text} />
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.dualChartsRow}>
          <Card style={[styles.halfChartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Card.Content style={styles.halfChartContent}>
              <Text style={[styles.chartTitleSmall, { color: colors.text }]}>Spent vs Left</Text>
              {spendVsLeft.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No income or spend data.</Text>
              ) : (
                <>
                  <DonutChart
                    items={spendVsLeft}
                    centerPrimary={currency(Math.max(income - monthTotal, 0))}
                    centerSecondary="left"
                    trackColor={colors.border}
                    primaryTextColor={colors.text}
                    secondaryTextColor={colors.textMuted}
                    compact={isCompact}
                  />
                  <Legend items={spendVsLeft} textColor={colors.textMuted} valueColor={colors.text} />
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={[styles.halfChartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Card.Content style={styles.halfChartContent}>
              <Text style={[styles.chartTitleSmall, { color: colors.text }]}>Weekday Pattern</Text>
              {weekdaySplit.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No weekday pattern yet.</Text>
              ) : (
                <>
                  <DonutChart
                    items={weekdaySplit}
                    centerPrimary={String(weekdaySplit.length)}
                    centerSecondary="active days"
                    trackColor={colors.border}
                    primaryTextColor={colors.text}
                    secondaryTextColor={colors.textMuted}
                    compact={isCompact}
                  />
                  <Legend items={weekdaySplit} textColor={colors.textMuted} valueColor={colors.text} />
                </>
              )}
            </Card.Content>
          </Card>
        </View>
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
    marginTop: 16,
    fontSize: 16,
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
  monthPickerButton: {
    backgroundColor: "#F7F3FF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthCenter: {
    alignItems: "center",
    flex: 1,
  },
  monthPickerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  monthPickerLabel: {
    fontSize: 12,
    color: "#7A748F",
    marginBottom: 4,
  },
  monthPickerValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  monthHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A748F",
    textAlign: "center",
  },
  inlineResetButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEE6FF",
    padding: 14,
    marginBottom: 14,
  },
  selectorBlock: {
    marginBottom: 14,
  },
  selectorTitle: {
    color: "#1F1B2E",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  yearRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F7F3FF",
  },
  yearChipActive: {
    backgroundColor: "#A259FF",
  },
  yearChipText: {
    color: "#5F557C",
    fontWeight: "600",
  },
  yearChipTextActive: {
    color: "#FFFFFF",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  monthChip: {
    width: "22%",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F7F3FF",
    alignItems: "center",
  },
  monthChipActive: {
    backgroundColor: "#1F1B2E",
  },
  monthChipDisabled: {
    backgroundColor: "#F3F1F7",
  },
  monthChipText: {
    color: "#5F557C",
    fontWeight: "600",
  },
  monthChipTextActive: {
    color: "#FFFFFF",
  },
  monthChipTextDisabled: {
    color: "#C0B9D1",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#1F1B2E",
  },
  summaryCardLight: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#F7F3FF",
  },
  summaryLabel: {
    color: "#C8C1E6",
    fontSize: 13,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  summaryLabelLight: {
    color: "#6B6780",
    fontSize: 13,
  },
  summaryValueLight: {
    color: "#1F1B2E",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  chartCard: {
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE6FF",
  },
  halfChartCard: {
    flex: 1,
    minHeight: 390,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE6FF",
  },
  halfChartContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  dualChartsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  chartTitleSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F1B2E",
    marginBottom: 10,
  },
  chartSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: "#7A748F",
    lineHeight: 20,
  },
  donutWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutPrimary: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1B2E",
  },
  donutSecondary: {
    marginTop: 2,
    fontSize: 12,
    color: "#7A748F",
  },
  legendList: {
    marginTop: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    flex: 1,
    color: "#4E4A62",
    fontSize: 13,
  },
  legendValue: {
    color: "#1F1B2E",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    color: "#7A748F",
    fontSize: 14,
  },
});
