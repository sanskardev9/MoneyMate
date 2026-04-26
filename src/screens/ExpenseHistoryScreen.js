import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  IconButton,
  Paragraph,
  Button as PaperButton,
  Text,
  TextInput as PaperTextInput,
  Title,
} from "react-native-paper";
import { supabase } from "../lib/supabase";
import { formatMonthLabel, getMonthBounds, getMonthBoundsFromKey } from "../lib/monthlyBudget";
import { useAppTheme } from "../context/ThemeContext";
import FormBottomSheet from "../components/FormBottomSheet";

export default function ExpenseHistoryScreen({ navigation, route }) {
  const { colors } = useAppTheme();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const selectedMonthKey = route?.params?.monthKey || null;
  const selectedMonthLabel = selectedMonthKey ? formatMonthLabel(selectedMonthKey) : null;

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonthKey]);

  const fetchExpenses = async () => {
    setLoading(true);
    const user = await supabase.auth.getUser();
    const { startIso, endIso } = selectedMonthKey
      ? getMonthBoundsFromKey(selectedMonthKey)
      : getMonthBounds();

    const { data: incomeData } = await supabase
      .from("incomes")
      .select("amount")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    setIncome(incomeData?.[0]?.amount || 0);

    const { data: expData } = await supabase
      .from("expenses")
      .select("id, category_id, amount, description, created_at")
      .eq("user_id", user.data.user.id)
      .gte("created_at", startIso)
      .lt("created_at", endIso)
      .order("created_at", { ascending: false });

    const { data: catData } = await supabase
      .from("budget_categories")
      .select("id, name, amount")
      .eq("user_id", user.data.user.id);

    const catMap = {};
    (catData || []).forEach((cat) => {
      catMap[cat.id] = { name: cat.name, budget: cat.amount };
    });

    setCategories(catMap);
    setExpenses(expData || []);
    setLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    setLoading(true);
    await supabase.from("expenses").delete().eq("id", id);
    await fetchExpenses();
    setLoading(false);
  };

  const openEditDialog = (expense) => {
    setEditExpense(expense);
    setEditAmount(String(expense.amount));
    setEditDescription(expense.description || "");
    setEditCategory(expense.category_id);
    setEditDialogVisible(true);
  };

  const handleEditExpense = async () => {
    setEditLoading(true);
    await supabase
      .from("expenses")
      .update({
        amount: Number(editAmount),
        description: editDescription,
        category_id: editCategory,
      })
      .eq("id", editExpense.id);
    setEditDialogVisible(false);
    setEditLoading(false);
    setEditExpense(null);
    await fetchExpenses();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const categorySpend = {};
  expenses.forEach((e) => {
    if (!categorySpend[e.category_id]) categorySpend[e.category_id] = 0;
    categorySpend[e.category_id] += Number(e.amount);
  });
  const overspends = Object.entries(categorySpend)
    .filter(([catId, spent]) => categories[catId] && spent > Number(categories[catId].budget))
    .map(([catId, spent]) => ({
      name: categories[catId].name,
      overspent: spent - Number(categories[catId].budget),
    }));

  const renderExpense = ({ item }) => (
    <Card style={[styles.expenseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Card.Content>
        <View style={styles.expenseHeader}>
          <Title style={[styles.expenseAmount, { color: colors.danger }]}>₹{item.amount}</Title>
          <Text style={[styles.expenseCategory, { color: colors.primary }]}>
            {categories[item.category_id]?.name || "Category"}
          </Text>
          <View style={styles.actionsRow}>
            <IconButton icon="pencil" iconColor={colors.primary} size={22} onPress={() => openEditDialog(item)} />
            <IconButton icon="delete" iconColor={colors.danger} size={22} onPress={() => handleDeleteExpense(item.id)} />
          </View>
        </View>
        {item.description ? (
          <Paragraph style={[styles.expenseDesc, { color: colors.textMuted }]}>{item.description}</Paragraph>
        ) : null}
        <Text style={[styles.expenseDate, { color: colors.textMuted }]}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={[styles.appbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Appbar.BackAction color={colors.text} onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={selectedMonthLabel ? `${selectedMonthLabel} Logs` : "Expense History"}
          titleStyle={{ color: colors.text, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <Card style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Card.Content>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
          <Text style={[styles.summaryText, { color: colors.textMuted }]}>
            Total Income:{" "}
            <Text style={{ color: income - totalExpenses < 0 ? colors.danger : colors.success, fontWeight: "bold" }}>
              ₹{income}
            </Text>
          </Text>
          <Text style={[styles.summaryText, { color: colors.textMuted }]}>
            Total Expenses: <Text style={{ color: colors.danger, fontWeight: "bold" }}>₹{totalExpenses}</Text>
          </Text>
          <Text style={[styles.summaryText, { color: colors.textMuted }]}>
            Income Left:{" "}
            <Text style={{ color: income - totalExpenses < 0 ? colors.danger : colors.success, fontWeight: "bold" }}>
              ₹{income - totalExpenses}
            </Text>
          </Text>
          {overspends.length > 0 ? (
            <Text style={[styles.summaryText, { marginTop: 8, fontWeight: "bold", color: colors.text }]}>
              Overspent Categories:
            </Text>
          ) : null}
          {overspends.map((item) => (
            <Text key={item.name} style={{ color: colors.danger, marginLeft: 8 }}>
              {item.name}: Overspent by ₹{item.overspent}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textMuted }]}>No expenses logged yet.</Text>}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
      />

      <FormBottomSheet
        visible={editDialogVisible}
        title="Edit Expense"
        reserveTabBarSpace={false}
        onClose={() => setEditDialogVisible(false)}
      >
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <FlatList
          data={Object.entries(categories)}
          horizontal
          keyExtractor={([id]) => id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item: [id, cat] }) => (
            <Chip
              mode={editCategory === id ? "flat" : "outlined"}
              style={
                editCategory === id
                  ? [styles.selectedChip, { backgroundColor: colors.primary }]
                  : [styles.chip, { backgroundColor: colors.surface, borderColor: colors.primary }]
              }
              textStyle={{ color: editCategory === id ? "#fff" : colors.primary, fontWeight: "bold" }}
              onPress={() => setEditCategory(id)}
            >
              {cat.name}
            </Chip>
          )}
        />
        <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
        <PaperTextInput
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surfaceMuted }]}
          value={editAmount}
          onChangeText={setEditAmount}
          keyboardType="numeric"
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
          left={<PaperTextInput.Icon name="currency-inr" color={colors.primary} />}
          textColor={colors.text}
          theme={{
            colors: {
              text: colors.text,
              primary: colors.primary,
              outline: colors.border,
              onSurfaceVariant: colors.textMuted,
              onSurface: colors.text,
              placeholder: colors.textMuted,
              background: colors.surfaceMuted,
              surface: colors.surfaceMuted,
            },
          }}
        />
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <PaperTextInput
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surfaceMuted }]}
          value={editDescription}
          onChangeText={setEditDescription}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
          left={<PaperTextInput.Icon name="note-outline" color={colors.primary} />}
          textColor={colors.text}
          theme={{
            colors: {
              text: colors.text,
              primary: colors.primary,
              outline: colors.border,
              onSurfaceVariant: colors.textMuted,
              onSurface: colors.text,
              placeholder: colors.textMuted,
              background: colors.surfaceMuted,
              surface: colors.surfaceMuted,
            },
          }}
        />
        <View style={styles.dialogButtons}>
          <PaperButton
            onPress={() => setEditDialogVisible(false)}
            mode="outlined"
            style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
            labelStyle={{ color: colors.textMuted, fontWeight: "bold" }}
          >
            Cancel
          </PaperButton>
          <PaperButton
            onPress={handleEditExpense}
            loading={editLoading}
            mode="contained"
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: "#fff", fontWeight: "bold" }}
          >
            Save
          </PaperButton>
        </View>
      </FormBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    elevation: 0,
    borderWidth: 1,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 15,
  },
  expenseCard: {
    marginBottom: 12,
    borderRadius: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    elevation: 0,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseAmount: {
    fontWeight: "bold",
    fontSize: 20,
  },
  expenseCategory: {
    fontWeight: "bold",
    fontSize: 16,
  },
  expenseDesc: {
    fontStyle: "italic",
    marginTop: 4,
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  dialog: {
    borderRadius: 20,
  },
  dialogTitle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    borderWidth: 1,
  },
  selectedChip: {
    marginRight: 8,
  },
  label: {
    marginBottom: 8,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: {
    borderWidth: 1,
  },
  addButton: {},
});
