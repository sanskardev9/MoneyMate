import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  SectionList,
  Alert,
  ScrollView,
} from "react-native";
import {
  Card,
  Text,
  FAB,
  Title,
  Paragraph,
  Modal,
  Portal,
  Button,
  TextInput,
  Appbar,
  Divider,
  Chip,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "../lib/supabase";
import Toast from "react-native-toast-message";
import MainScreenWrapper from "../components/MainScreenWrapper";
import { getMonthBounds } from "../lib/monthlyBudget";
import { useAppTheme } from "../context/ThemeContext";
import { useTabShell } from "../context/TabShellContext";
import FormBottomSheet from "../components/FormBottomSheet";
import useCompactLayout from "../hooks/useCompactLayout";

export default function ExpenseScreen({ navigation }) {
  const { colors, isDarkMode } = useAppTheme();
  const tabShell = useTabShell();
  const isCompact = useCompactLayout();
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({ amount: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [income, setIncome] = useState(0);
  const [showDropDown, setShowDropDown] = useState(false);
  const categoryList = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditExpense = (expense) => {
    setSelectedCategory(expense.category_id);
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description || "",
    });
    setShowForm(true);
    setEditingExpenseId(expense.id);
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want toa delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase.from("expenses").delete().eq("id", expenseId);
            fetchExpenses();
          },
        },
      ]
    );
  };

  const quotes = [
    "A penny saved is a penny earned.",
    "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
    "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
    "The art is not in making money, but in keeping it.",
    "Save money and money will save you.",
    "It’s not your salary that makes you rich, it’s your spending habits.",
    "Don’t tell me what you value, show me your budget, and I’ll tell you what you value. – Joe Biden",
    "The quickest way to double your money is to fold it in half and put it in your back pocket.",
    "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
    "Small daily savings are the first step toward big financial freedom.",
    "Every rupee with a purpose is a rupee working for you.",
    "Wealth grows when your spending obeys your plan.",
    "Discipline today builds comfort tomorrow.",
    "Saving is how you buy peace of mind in advance.",
    "A strong budget gives every goal a place to live.",
    "Financial progress is usually quiet, steady, and consistent.",
    "Spend with intention, save with ambition.",
    "The habit of tracking money is the habit of taking control.",
    "Money flows best when you tell it where to go.",
    "Good budgets do not restrict your life, they direct it.",
    "The little choices you repeat shape the future you afford.",
    "Saving is not about missing out, it is about choosing better later.",
    "Your future self notices every smart money decision you make today.",
    "Rich habits begin long before rich balances.",
    "A planned expense feels lighter than a surprise one.",
    "Consistency beats intensity when it comes to money.",
    "Track it, trim it, grow it.",
    "Budgeting is self-care for your finances.",
    "Financial clarity turns stress into strategy.",
  ];

  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserName(),
          fetchCategories(),
          fetchIncome(),
          fetchExpenses(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    if (showForm && categories.length > 0) {
      const found = categories.find((cat) => cat.id === selectedCategory);
      if (!found) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [showForm, categories]);

  const fetchUserName = async (retry = 0) => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.data.user.id)
      .single();
    if (!error && data && data.name && data.name.trim()) {
      const firstName = data.name.trim().split(" ")[0];
      setUserName(firstName);
    } else if (retry < 3) {
      setTimeout(() => fetchUserName(retry + 1), 700);
    } else {
      setUserName("User");
    }
  };

  const fetchCategories = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("budget_categories")
      .select("id, name, amount, parent_id")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: true });
    if (!error && data && data.length > 0) {
      setCategories(data);
      // Set first main category as default
      const mainCategories = data.filter((cat) => !cat.parent_id);
      if (mainCategories.length > 0) {
        setSelectedCategory(mainCategories[0].id);
      }
    } else {
      setCategories([]);
      setSelectedCategory("");
    }
  };

  // Get main categories (no parent_id)
  const getMainCategories = () => {
    return categories.filter((cat) => !cat.parent_id);
  };

  // Get subcategories for a specific parent
  const getSubcategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const getDirectCategorySpend = (categoryId) => {
    return expenses
      .filter((expense) => expense.category_id === categoryId && expense.id !== editingExpenseId)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  };

  const getAvailableParentCategoryBudget = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;

    const subcategoriesTotal = getSubcategories(categoryId).reduce(
      (sum, subcat) => sum + Number(subcat.amount || 0),
      0
    );
    const directSpent = getDirectCategorySpend(categoryId);

    return Number(category.amount || 0) - subcategoriesTotal - directSpent;
  };

  // Get all categories for selection (main + subcategories)
  const getAllCategoriesForSelection = () => {
    const mainCategories = getMainCategories();
    const allCategories = [];

    mainCategories.forEach((mainCat) => {
      allCategories.push(mainCat);
      const subcategories = getSubcategories(mainCat.id);
      subcategories.forEach((subcat) => {
        allCategories.push({
          ...subcat,
          name: `  ${subcat.name}`, // Indent subcategories
          displayName: `${mainCat.name} > ${subcat.name}`, // For display
        });
      });
    });

    return allCategories;
  };

  const fetchIncome = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("incomes")
      .select("amount")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!error && data && data.amount) {
      setIncome(data.amount);
    } else {
      setIncome(0);
    }
  };

  const fetchExpenses = async () => {
    const user = await supabase.auth.getUser();
    const { startIso, endIso } = getMonthBounds();
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.data.user.id)
      .gte("created_at", startIso)
      .lt("created_at", endIso)
      .order("created_at", { ascending: false });
    setExpenses(data || []);
  };

  // Remove this useEffect since fetchExpenses is now called in loadAllData

  const handleAddOrEditExpense = async () => {
    if (
      !selectedCategory ||
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please select a category and enter a valid amount.",
      });
      return;
    }
    setLoading(true);

    const selectedCategoryDetails = categories.find((cat) => cat.id === selectedCategory);
    const isParentCategory = selectedCategoryDetails && !selectedCategoryDetails.parent_id;
    const hasSubcategories = getSubcategories(selectedCategory).length > 0;

    if (isParentCategory && hasSubcategories) {
      const availableBudget = getAvailableParentCategoryBudget(selectedCategory);
      const expenseAmount = Number(formData.amount);

      if (availableBudget !== null && expenseAmount > availableBudget) {
        Toast.show({
          type: "error",
          text1:
            availableBudget <= 0
              ? "This category's budget is fully assigned."
              : `Only ₹${availableBudget.toLocaleString("en-IN")} is still unassigned here.`,
          text2:
            availableBudget <= 0
              ? "Choose one of its subcategories to log this expense."
              : "Use a subcategory, or reduce the amount to stay within the unassigned balance.",
        });
        setLoading(false);
        return;
      }
    }

    const user = await supabase.auth.getUser();
    if (editingExpenseId) {
      // Update existing expense
      const { error } = await supabase
        .from("expenses")
        .update({
          category_id: selectedCategory,
          amount: Number(formData.amount),
          description: formData.description,
        })
        .eq("id", editingExpenseId);
      if (error) {
        Toast.show({
          type: "error",
          text1: "Failed to update expense. Try again.",
        });
        setLoading(false);
        return;
      }
      Toast.show({ type: "success", text1: "Expense updated!" });
    } else {
      // Add new expense
      const { error } = await supabase.from("expenses").insert([
        {
          user_id: user.data.user.id,
          category_id: selectedCategory,
          amount: Number(formData.amount),
          description: formData.description,
        },
      ]);
      if (error) {
        Toast.show({
          type: "error",
          text1: "Failed to log expense. Try again.",
        });
        setLoading(false);
        return;
      }
      Toast.show({ type: "success", text1: "Expense logged!" });
    }
    setLoading(false);
    setShowForm(false);
    setFormData({ amount: "", description: "" });
    setSelectedCategory(categories[0]?.id || "");
    setEditingExpenseId(null);
    fetchExpenses();
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  }

  const categoryNameLookup = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return "Unknown";

    // If it's a subcategory, show parent > subcategory
    if (cat.parent_id) {
      const parentCat = categories.find((c) => c.id === cat.parent_id);
      return parentCat ? `${parentCat.name} > ${cat.name}` : cat.name;
    }

    return cat.name;
  };

  // --- Helper to clean and parse Supabase timestamps ---
  const parseSupabaseTimestamp = (timestamp) => {
    if (!timestamp) return null;
    // Remove fractional seconds and normalize timezone
    const cleaned = timestamp
      .replace(/\.\d+/, "") // remove fractional seconds
      .replace(" ", "T") // space to T
      .replace("+00:00", "Z"); // ensure UTC Z
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  };

  // --- Safe section date formatter ---
  const formatSectionDate = (dateStr) => {
    // Here, dateStr is YYYY-MM-DD
    const d = new Date(dateStr + "T00:00:00");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      console.warn(`Invalid date: ${dateStr}`);
      return "Invalid Date";
    }
  };

  // --- Safe time formatter ---
  const formatTime = (timestamp) => {
    const d = parseSupabaseTimestamp(timestamp);
    if (d) {
      return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      console.warn(`Invalid time: ${timestamp}`);
      return "Invalid Time";
    }
  };

  // --- Grouping by safe ISO date ---
  const groupExpensesByDate = (expenses) => {
    const groups = {};
    expenses.forEach((exp) => {
      const d = parseSupabaseTimestamp(exp.created_at);
      if (d) {
        const key =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0"); // Local date YYYY-MM-DD
        if (!groups[key]) groups[key] = [];
        groups[key].push(exp);
      } else {
        console.warn(`Invalid date: ${exp.created_at}`);
      }
    });

    return Object.entries(groups).map(([date, data]) => ({
      title: date, // Keep as YYYY-MM-DD for formatting later
      data,
    }));
  };

  // --- Build sections ---
  const sections = groupExpensesByDate(expenses);

  if (isLoading) {
    return (
      <MainScreenWrapper navigation={navigation} currentRoute="Expense">
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading your expenses...</Text>
        </View>
        <Toast />
      </MainScreenWrapper>
    );
  }

  return (
    <MainScreenWrapper navigation={navigation} currentRoute="Expense">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={64}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: isCompact ? 12 : 16,
              paddingTop: isCompact ? 12 : 16,
              paddingBottom: tabShell ? 0 : 55,
              backgroundColor: colors.background,
            }}
          >
            {/* Header with dynamic greeting and logout */}
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "start`",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.greetingLarge, { color: colors.text, fontSize: isCompact ? 22 : 26, marginBottom: isCompact ? 6 : 8 }]}>{`${getGreeting()}, ${
                  userName.split(" ")[0]
                }`}</Text>
                <Text style={[styles.quote, { color: colors.textMuted, fontSize: isCompact ? 14 : 16, lineHeight: isCompact ? 20 : 24 }]}>{quote}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.settingsButton,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                    width: isCompact ? 35 : 35 ,
                    height: isCompact ? 35 : 35,
                    borderRadius: isCompact ? 14 : 16,
                  },
                ]}
                onPress={() => navigation.navigate("Settings")}
              >
                <Icon name="cog" size={isCompact ? 16 : 18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <Card style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: isCompact ? 18 : 12 }]}>
              <Card.Content>
                <Text style={[styles.balanceLabel, { color: colors.text, fontSize: isCompact ? 14 : 16 }]}>Total Income</Text>
                <Text style={[styles.balanceValue, { color: colors.primary, fontSize: isCompact ? 28 : 32 }]}>
                  {`₹${income.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                </Text>
              </Card.Content>
            </Card>

            {/* Payment List */}
            {/* Payment List (scrollable & full-height) */}
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 24,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: isCompact ? 16 : 18 },
                    { color: isDarkMode ? "#F4EEFF" : colors.text },
                  ]}
                >
                  Expense History
                </Text>
              </View>

              {expenses.length > 0 ? (
                <SectionList
                  sections={sections}
                  keyExtractor={(item) => item.id}
                  renderSectionHeader={({ section: { title } }) => (
                <Text
                  style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginTop: 16,
                        marginBottom: 4,
                        color: colors.text,
                      }}
                    >
                      {formatSectionDate(title)}
                    </Text>
                  )}
                  // renderItem={({ item }) => (
                  //   <Card style={{ marginBottom: 12, marginHorizontal: 4, borderRadius: 12 }} pointerEvents="none">
                  //     <Card.Content>
                  //       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  //         <View style={{ flex: 1 }}>
                  //           <Text style={{ fontWeight: '600', color: '#222', fontSize: 16, marginBottom: 4 }}>
                  //             {item.description || 'No description'}
                  //           </Text>
                  //           <Text style={{ color: '#888', fontSize: 14 }}>
                  //             {categoryNameLookup(item.category_id)}
                  //           </Text>
                  //         </View>
                  //         <View style={{ alignItems: 'flex-end' }}>
                  //           <Text style={{ color: '#A259FF', fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>
                  //             {`₹${item.amount}`}
                  //           </Text>
                  //           <Text style={{ color: '#bbb', fontSize: 12 }}>
                  //             {formatTime(item.created_at)}
                  //           </Text>
                  //         </View>
                  //       </View>
                  //     </Card.Content>
                  //   </Card>
                  // )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={1} // keeps visuals unchanged
                      onPress={() => {
                        /* empty */
                      }} // prevents child capture
                    >
                      <Card
                        style={{
                          marginBottom: 12,
                          marginHorizontal: 4,
                          borderRadius: 12,
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Card.Content>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontWeight: "600",
                                  color: colors.text,
                                  fontSize: 16,
                                  marginBottom: 4,
                                }}
                              >
                                {item.description || "No description"}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                                {categoryNameLookup(item.category_id)}
                              </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontWeight: "bold",
                                  fontSize: 18,
                                  marginBottom: 4,
                                }}
                              >
                                {`₹${item.amount}`}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                {formatTime(item.created_at)}
                              </Text>
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: tabShell ? 110 : 120 }}
                  stickySectionHeadersEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[
                      styles.emptyMessage,
                      { color: isDarkMode ? "#D9D0F5" : colors.textMuted },
                    ]}
                  >
                    Expense? Let's MoneyMate 💸
                  </Text>
                </View>
              )}
            </View>
            {/* Add Expense FAB */}
            {!showForm && (
              <FAB
                style={[
                  styles.fabFooter,
                  { backgroundColor: colors.primary, bottom: tabShell ? (isCompact ? 82 : 88) : 100, transform: [{ scale: isCompact ? 0.9 : 1 }] },
                ]}
                icon="plus"
                onPress={() => setShowForm(true)}
                color="#fff"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <FormBottomSheet
          visible={showForm}
          title={editingExpenseId ? "Edit Expense" : "Add Expense"}
          onClose={() => {
            setShowForm(false);
            setFormData({ amount: "", description: "" });
            setSelectedCategory(categories[0]?.id || "");
            setEditingExpenseId(null);
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {getAllCategoriesForSelection().map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
                    selectedCategory === cat.id &&
                      [styles.selectedCategoryChip, { backgroundColor: colors.primary }],
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      [styles.categoryChipText, { color: colors.text }],
                      selectedCategory === cat.id &&
                        [styles.selectedCategoryChipText, { color: "#FFFFFF" }],
                    ]}
                  >
                    {cat.displayName || cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            mode="outlined"
            label="Amount"
            value={formData.amount}
            onChangeText={(text) =>
              setFormData({ ...formData, amount: text })
            }
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
            placeholderTextColor={colors.textMuted}
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
            textColor={colors.text}
            left={
              <TextInput.Icon icon="currency-inr" color={colors.primary} />
            }
          />
          <TextInput
            mode="outlined"
            label="Description (optional)"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            style={[styles.input, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
            placeholderTextColor={colors.textMuted}
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
            textColor={colors.text}
            left={
              <TextInput.Icon icon="note-outline" color={colors.primary} />
            }
          />
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <Button
              mode="contained"
              onPress={handleAddOrEditExpense}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
              loading={loading}
            >
              {loading
                ? editingExpenseId
                  ? "Updating..."
                  : "Adding..."
                : editingExpenseId
                ? "Update Expense"
                : "Add Expense"}
            </Button>
            <View style={{ width: 12 }} />
            <Button
              mode="outlined"
              style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
              onPress={() => {
                setShowForm(false);
                setFormData({ amount: "", description: "" });
                setSelectedCategory(categories[0]?.id || "");
                setEditingExpenseId(null);
              }}
              labelStyle={{ color: colors.textMuted, fontWeight: "bold" }}
            >
              Cancel
            </Button>
          </View>
        </FormBottomSheet>
        <Toast />
      </KeyboardAvoidingView>
    </MainScreenWrapper>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 4,
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "#A259FF33",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  greeting: {
    fontSize: 18,
    color: "#222222",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  greetingLarge: {
    fontSize: 26,
    color: "#222222",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 8,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    elevation: 2,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  balanceLabel: {
    color: "#000",
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 600,
  },
  balanceValue: {
    color: "#A259FF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
    marginTop: -32,
    marginBottom: 16,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  actionItem: { alignItems: "center", flex: 1 },
  actionLabel: { color: "#A259FF", marginTop: 4, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#222222" },
  viewAll: { color: "#A259FF", fontWeight: "bold" },
  categoryCard: {
    width: cardWidth,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    margin: 4,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  categoryLabel: { marginTop: 8, color: "#222222", fontWeight: "500" },
  fab: {
    position: "absolute",
    bottom: 88,
    alignSelf: "center",
    backgroundColor: "#A259FF",
    elevation: 4,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    alignSelf: "center",
    borderRadius: 20,
    padding: 0,
    minHeight: 350,
    elevation: 5,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#A259FF",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 4,
  },
  divider: {
    backgroundColor: "#A259FF",
    height: 2,
    marginVertical: 8,
    borderRadius: 2,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    marginTop: 12,
    color: "#222222",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    color: "#222222",
    borderColor: "#A259FF",
    borderWidth: 1,
  },
  chipRow: { paddingVertical: 4, paddingBottom: 8 },
  chip: {
    marginRight: 8,
    backgroundColor: "#F7F7F7",
    borderColor: "#A259FF",
    borderWidth: 1,
    height: 36,
  },
  selectedChip: { marginRight: 8, backgroundColor: "#A259FF", height: 36 },
  addButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#A259FF",
    width: "100%",
    alignSelf: "center",
  },
  cancelButton: {
    marginTop: 4,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    borderColor: "#EB5757",
    borderWidth: 1,
  },
  quote: {
    fontStyle: "italic",
    fontSize: 16,
    color: "#888888",
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: "#000",
    borderRadius: 8,
    borderColor: "#00ff99",
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 4,
  },
  picker: { color: "#fff", height: 48, width: "100%" },
  formButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  formCard: {
    marginBottom: 16,
    marginHorizontal: 4,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderColor: "#A259FF",
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A259FF",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#222222",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "transparent",
    color: "#222222",
    borderRadius: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#F7F7F7",
    borderColor: "#A259FF",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedCategoryChip: { backgroundColor: "#A259FF" },
  categoryChipText: { color: "#222222", fontWeight: "bold" },
  selectedCategoryChipText: { color: "#FFFFFF", fontWeight: "bold" },
  addButton: { flex: 1, backgroundColor: "#A259FF", borderRadius: 10 },
  saveButton: {
    flex: 1,
    backgroundColor: "#A259FF",
    borderRadius: 10,
  },
  cancelButton: { flex: 1, borderColor: "#888888", borderRadius: 10 },
  fabFooter: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#A259FF",
    elevation: 4,
    zIndex: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888888",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888888",
    fontWeight: "300",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    display:'flex',
    alignItems:"center",
    justifyContent:'center',
    borderColor: "#E0E0E0",
  },
});
