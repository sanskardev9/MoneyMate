import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";

import {
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
  ProgressBar,
} from "react-native-paper";
import { supabase } from "../lib/supabase";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import CustomModal from "../components/CustomModal";
import BudgetCategoriesHeader from "../components/BudgetCategoriesHeader";

const BudgetCategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", amount: "", id: null });
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmNavigation, setConfirmNavigation] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [editIncomeModalVisible, setEditIncomeModalVisible] = useState(false);
  const [newIncome, setNewIncome] = useState(String(income));
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const DEFAULT_CATEGORIES = [
    { name: "Needs", amount: 0 },
    { name: "Wants", amount: 0 },
    { name: "Savings", amount: 0 },
  ];

  useEffect(() => {
    fetchUserAndData();
    fetchUserName();
  }, []);

  const fetchUserAndData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    console.log("Current user:", user);
    await fetchIncome(user.id);
    await fetchCategories(user.id);
    await fetchUserName(user.id);
    setLoading(false);
  };

  const fetchUserName = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    if (!error && data?.name) {
      setUserName(data.name);
    } else {
      setUserName("User");
    }
  };

  const fetchIncome = async (user_id) => {
    const { data, error } = await supabase
      .from("incomes")
      .select("amount, created_at, user_id")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Fetched income data:", data, "Error:", error);

    if (data && data.length > 0) setIncome(data[0].amount);
    else setIncome(0);
  };

  const fetchCategories = async (user_id) => {
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: true });

    // Just set categories, don't auto-insert defaults
    setCategories(data || []);
  };

  const totalAllocated = categories.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );
  const allocationRatio = totalAllocated / income;
  let barColor = "#00ff99";
  if (allocationRatio > 1) barColor = "red";
  else if (allocationRatio > 0.9) barColor = "orange";

  // const getGreeting = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 12) return "Good morning ";
  //   if (hour < 18) return "Good afternoon ";
  //   return "Good evening ";
  // };

  const handleAddOrEdit = async () => {
    if (!form.name || !form.amount) {
      Alert.alert("Error", "Please enter both name and amount.");
      return;
    }
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      Alert.alert("Error", "Amount must be a positive number.");
      return;
    }
    const newTotal =
      totalAllocated -
      (form.id ? categories.find((c) => c.id === form.id).amount : 0) +
      Number(form.amount);
    if (newTotal > income) {
      Alert.alert("Error", "Total allocation exceeds your income!");
      return;
    }
    if (form.id) {
      await supabase
        .from("budget_categories")
        .update({ name: form.name, amount: Number(form.amount) })
        .eq("id", form.id);
    } else {
      await supabase
        .from("budget_categories")
        .insert([
          { user_id: user.id, name: form.name, amount: Number(form.amount) },
        ]);
    }
    setForm({ name: "", amount: "", id: null });
    setShowForm(false);
    fetchCategories(user.id);
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      amount: String(category.amount),
      id: category.id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await supabase.from("budget_categories").delete().eq("id", categoryToDelete.id);
          fetchCategories(user.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };
  console.log("UserName: ", userName);

  // Prefill default categories based on income
  const prefillDefaultCategories = (income, user_id) => [
    { name: "Needs", amount: Math.round(income * 0.5), user_id },
    { name: "Wants", amount: Math.round(income * 0.3), user_id },
    { name: "Savings", amount: Math.round(income * 0.2), user_id },
  ];

  // Add recommended categories if none exist
  const handleAddRecommendedCategories = async () => {
    if (!user || !income) return;
    const defaultCats = prefillDefaultCategories(income, user.id);
    const { data: inserted, error } = await supabase
      .from("budget_categories")
      .insert(defaultCats)
      .select();
    if (!error) setCategories(inserted || []);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <BudgetCategoriesHeader />
          <View>
            {/* <Text style={styles.header}>Budget Categories</Text> */}
            {/* <Text style={styles.greeting}>{`${getGreeting()}, ${userName}`}</Text> */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#222222",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Total Income: ₹{income}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNewIncome(String(income));
                      setEditIncomeModalVisible(true);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Feather name="edit" size={18} color="#A259FF" />
                  </TouchableOpacity>
                </View>

                <Text style={{ color: "#888888" }}>
                  Remaining Budget: ₹{income - totalAllocated}
                </Text>
                <ProgressBar
                  progress={income ? totalAllocated / income : 0}
                  color="#A259FF"
                  style={{ marginTop: 8 }}
                />
                <Text style={{ color: "#A259FF", marginTop: 4 }}>
                  {income
                    ? `${Math.round(
                        (totalAllocated / income) * 100
                      )}% allocated `
                    : "Start by adding your income 💰"}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Animated.View entering={FadeInDown}>
                  <Card style={styles.card}>
                    <Card.Title
                      title={item.name}
                      subtitle={`₹${item.amount}`}
                      titleStyle={{ color: "#222222" }}
                      subtitleStyle={{ color: "#888888" }}
                      right={() => (
                        <View style={{ flexDirection: "row" }}>
                          <IconButton
                            icon="pencil"
                            onPress={() => handleEdit(item)}
                          />
                          <IconButton
                            icon="delete"
                            onPress={() => handleDelete(item.id)}
                          />
                        </View>
                      )}
                    />
                  </Card>
                </Animated.View>
              )}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#888888",
                      fontSize: 16,
                      marginBottom: 16,
                    }}
                  >
                    No categories yet. Let's MoneyMate it 💸
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#A259FF",
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        flex: 1,
                      }}
                      onPress={handleAddRecommendedCategories}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        + Recommended Categories
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        // backgroundColor: "#F7F7F7",
                        // borderRadius: 10,
                        // paddingVertical: 12,
                        // paddingHorizontal: 16,
                        // borderWidth: 1,
                        borderColor: "#A259FF",
                      }}
                      onPress={() => setShowInfoModal(true)}
                    >
                      <Ionicons name="information-circle-outline" size={22} color="#A259FF" />
                    </TouchableOpacity>
                  </View>
                </View>
              }
              style={{ marginBottom: 16 }}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </View>
          {showForm ? (
            <Card style={styles.formCard}>
              <Card.Content>
                <TextInput
                  label="Category Name"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  style={styles.input}
                  placeholderTextColor="#888888"
                  theme={{
                    colors: {
                      text: "#222222",
                      primary: "#A259FF",
                      placeholder: "#888888",
                      background: "#FFFFFF",
                    },
                  }}
                  textColor="#222222"
                />
                <TextInput
                  label="Amount"
                  value={form.amount}
                  onChangeText={(text) => setForm({ ...form, amount: text })}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#888888"
                  theme={{
                    colors: {
                      text: "#222222",
                      primary: "#A259FF",
                      placeholder: "#888888",
                      background: "#FFFFFF",
                    },
                  }}
                  textColor="#222222"
                />
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <Button
                    mode="contained"
                    onPress={handleAddOrEdit}
                    style={{
                      backgroundColor: "#A259FF",
                      borderRadius: 10,
                      flex: 1,
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  >
                    {form.id ? "Update" : "Add"}
                  </Button>
                  <View style={{ width: 12 }} />
                  <Button
                    mode="outlined"
                    style={{
                      borderColor: "#888888",
                      borderRadius: 10,
                      flex: 1,
                    }}
                    onPress={() => {
                      setShowForm(false);
                      setForm({ name: "", amount: "", id: null });
                    }}
                    labelStyle={{ color: "#888888", fontWeight: "bold" }}
                  >
                    Continue
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={() => setShowForm(true)}
                style={styles.addButton}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
              >
                Add Category
              </Button>
              <Button
                mode="outlined"
                style={{
                  marginTop: 10,
                  borderColor: "#888888",
                  borderRadius: 10,
                }}
                onPress={() => {
                  if (totalAllocated >= income) {
                    navigation.navigate("Expense");
                  } else {
                    setShowModal(true); // ✅ Just reuse showModal
                  }
                }}
                labelStyle={{ color: "#888888" }}
              >
                Continue
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
          <CustomModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={() => {
              setShowModal(false); // Close modal
              navigation.navigate("Expense"); // ✅ Now it navigates
            }}
            title="Skip Budgeting?"
        message="It's cool to skip — just don't ghost your budget forever, You can always set it up later!😉"
            confirmText="Continue Anyway"
          />

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />

        {/* Info Modal */}
        <CustomModal
  visible={showInfoModal}
  onClose={() => setShowInfoModal(false)}
  onConfirm={() => setShowInfoModal(false)}
  title="50/30/20 Budgeting Rule"
  message={
    <View style={{ paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, marginBottom: 8 }}>
        The 50/30/20 Rule is a simple budgeting method:
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        • <Text style={{ fontWeight: 'bold' }}>50%</Text> for Needs (rent, food, transport)
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        • <Text style={{ fontWeight: 'bold' }}>30%</Text> for Wants (shopping, dining out)
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        • <Text style={{ fontWeight: 'bold' }}>20%</Text> for Savings (investments, debt)
      </Text>
      <Text style={{ fontSize: 14, marginTop: 8 }}>
        You can also add custom categories using the {"\n"}
        <Text style={{ fontWeight: 'bold' }}>Add category</Text> button below to suit your lifestyle.
      </Text>
    </View>
  }
  confirmText="Got it!"
/>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 10,
    textAlign: "start",
    fontStyle: "italic",
    textShadowColor: "#A259FF33",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    elevation: 2,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    shadowColor: "#A259FF33",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderColor: "#A259FF",
    borderWidth: 1,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#A259FF",
    color: "#222222",
    borderWidth: 1,
    borderRadius: 8,
  },
  addButton: { marginTop: 12, backgroundColor: "#A259FF", borderRadius: 10 },
  greeting: {
    fontSize: 20,
    color: "#222222",
    fontWeight: "600",
    marginLeft: 15,
    marginBottom: 12,
  },
  label: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  summaryText: {
    color: "#888888",
    fontSize: 14,
    marginVertical: 8,
    textAlign: "center",
  },
  toggle: { marginTop: 16, textAlign: "center", color: "#A259FF" },
  chip: {
    marginRight: 8,
    backgroundColor: "#F7F7F7",
    borderColor: "#A259FF",
    borderWidth: 1,
    height: 36,
  },
  selectedChip: { marginRight: 8, backgroundColor: "#A259FF", height: 36 },
  cardTitle: { color: "#222222", fontWeight: "bold" },
  cardSubtitle: { color: "#888888" },
  addButtonLabel: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    marginTop: 4,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    borderColor: "#EB5757",
    borderWidth: 1,
  },
});

export default BudgetCategoriesScreen;
