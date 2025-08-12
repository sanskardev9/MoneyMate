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
  Chip,
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
  const [incomeDetails, setIncomeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", amount: "", id: null, parent_id: null });
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
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [includeBorrowedInBudget, setIncludeBorrowedInBudget] = useState(true);

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
      .select("amount, type, source, due_date, created_at, user_id")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Fetched income data:", data, "Error:", error);

    if (data && data.length > 0) {
      setIncome(data[0].amount);
      // Store income details for display
      setIncomeDetails(data[0]);
    } else {
      setIncome(0);
      setIncomeDetails(null);
    }
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

  // Get main categories (no parent_id)
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent_id);
  };

  // Get subcategories for a specific parent
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  // Calculate earned and borrowed income
  const earnedIncome = incomeDetails?.type === 'salary' ? income : 0;
  const borrowedIncome = incomeDetails?.type === 'borrowed' ? income : 0;
  const totalAvailableIncome = includeBorrowedInBudget ? income : earnedIncome;
  
  // Calculate total allocation including only main categories (subcategories are divisions of main categories)
  const totalAllocated = categories
    .filter(c => !c.parent_id) // Only main categories
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const allocationRatio = totalAllocated / totalAvailableIncome;
  let barColor = "#00ff99";
  if (allocationRatio > 1) barColor = "red";
  else if (allocationRatio > 0.9) barColor = "orange";

  const handleAddOrEdit = async () => {
    if (!form.name || !form.amount) {
      Alert.alert("Error", "Please enter both name and amount.");
      return;
    }
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      Alert.alert("Error", "Amount must be a positive number.");
      return;
    }

    const newAmount = Number(form.amount);
    
    // Calculate current total allocation (main categories only)
    const editingAmount = form.id ? categories.find((c) => c.id === form.id)?.amount || 0 : 0;
    
    // For main categories, check against total available income
    if (!form.parent_id) {
      const newTotalAllocation = totalAllocated - editingAmount + newAmount;
      if (newTotalAllocation > totalAvailableIncome) {
        Alert.alert("Error", `Total allocation (₹${newTotalAllocation.toLocaleString('en-IN')}) would exceed your available income (₹${totalAvailableIncome.toLocaleString('en-IN')})!`);
        return;
      }
    }
    
    // If adding or editing a subcategory, check against remaining budget of parent
    if (form.parent_id) {
      const remainingBudget = getRemainingBudget(form.parent_id);
      if (newAmount > remainingBudget) {
        Alert.alert("Error", `Amount cannot exceed remaining budget of ₹${remainingBudget.toLocaleString('en-IN')}`);
        return;
      }
    }
    if (form.id) {
      await supabase
        .from("budget_categories")
        .update({ name: form.name, amount: Number(form.amount), parent_id: form.parent_id })
        .eq("id", form.id);
    } else {
      await supabase
        .from("budget_categories")
        .insert([
          { user_id: user.id, name: form.name, amount: Number(form.amount), parent_id: form.parent_id },
        ]);
    }
    setForm({ name: "", amount: "", id: null, parent_id: null });
    setShowForm(false);
    setSelectedParentCategory(null);
    fetchCategories(user.id);
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      amount: String(category.amount),
      id: category.id,
      parent_id: category.parent_id,
    });
    setSelectedParentCategory(category.parent_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    setCategoryToDelete(category);
    
    // Check if category or its subcategories have any expenses
    const hasExpenses = await checkCategoryExpenses(id);
    
    if (hasExpenses) {
      // Show detailed modal with move/delete options
      setShowDeleteModal(true);
    } else {
      // Show simple delete confirmation
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${category.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => confirmDelete() }
        ]
      );
    }
  };

  const checkCategoryExpenses = async (categoryId) => {
    try {
      // Get all subcategory IDs recursively
      const getAllSubcategoryIds = (parentId) => {
        const subcategories = categories.filter(cat => cat.parent_id === parentId);
        let allIds = [];
        subcategories.forEach(subcat => {
          allIds.push(subcat.id);
          allIds = allIds.concat(getAllSubcategoryIds(subcat.id));
        });
        return allIds;
      };
      
      const categoryIds = [categoryId, ...getAllSubcategoryIds(categoryId)];
      
      // Check if any of these categories have expenses
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('id')
        .in('category_id', categoryIds)
        .limit(1);
      
      if (error) {
        console.error('Error checking expenses:', error);
        return false;
      }
      
      return expenses && expenses.length > 0;
    } catch (error) {
      console.error('Error checking category expenses:', error);
      return false;
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        // Also delete all subcategories
        await supabase.from("budget_categories").delete().eq("parent_id", categoryToDelete.id);
        await supabase.from("budget_categories").delete().eq("id", categoryToDelete.id);
        fetchCategories(user.id);
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
        Alert.alert('Error', 'Failed to delete category. Please try again.');
      }
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setSelectedParentCategory(parentCategory.id);
    setForm({ name: "", amount: "", id: null, parent_id: parentCategory.id });
    setShowForm(true);
  };

  // Calculate remaining budget for a category
  const getRemainingBudget = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    
    const allocated = Number(category.amount);
    
    // Calculate total amount already allocated to subcategories
    const subcategories = getSubcategories(categoryId);
    const subcategoriesTotal = subcategories.reduce((sum, subcat) => sum + Number(subcat.amount), 0);
    
    // Remaining budget = allocated - subcategories total
    return Math.max(0, allocated - subcategoriesTotal);
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

  const renderCategoryItem = ({ item }) => {
    const subcategories = getSubcategories(item.id);
    const isMainCategory = !item.parent_id;
    
    return (
      <Animated.View entering={FadeInDown}>
        <Card style={[styles.card, isMainCategory && styles.mainCategoryCard]}>
          <Card.Title
            title={item.name}
            subtitle={`₹${item.amount}`}
            titleStyle={{ color: "#222222", fontWeight: isMainCategory ? "bold" : "normal" }}
            subtitleStyle={{ color: "#888888" }}
            right={() => (
              <View style={{ flexDirection: "row" }}>
                {isMainCategory && (
                  <IconButton
                    icon="plus"
                    onPress={() => handleAddSubcategory(item)}
                    iconColor="#A259FF"
                  />
                )}
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
          {subcategories.length > 0 && (
            <Card.Content>
              <View style={styles.subcategoriesContainer}>
                <View style={styles.subcategoriesHeader}>
                  <Text style={styles.subcategoriesTitle}>Sub Categories</Text>
                </View>
                {subcategories.map((subcat) => (
                  <View key={subcat.id} style={styles.subcategoryItem}>
                    <View style={styles.subcategoryInfo}>
                      <Text style={styles.subcategoryName}>{subcat.name}</Text>
                      <Text style={styles.subcategoryAmount}>₹{subcat.amount}</Text>
                    </View>
                    <View style={styles.subcategoryActions}>
                      <IconButton
                        icon="pencil"
                        size={16}
                        onPress={() => handleEdit(subcat)}
                      />
                      <IconButton
                        icon="delete"
                        size={16}
                        onPress={() => handleDelete(subcat.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          )}
        </Card>
      </Animated.View>
    );
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
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#222222",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    💰 Total Income: ₹{income.toLocaleString('en-IN')}
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

                {/* Display earned vs borrowed income */}
                {incomeDetails?.type === 'borrowed' && (
                  <View style={styles.incomeBreakdown}>
                    <View style={styles.incomeRow}>
                      <Text style={styles.earnedIncomeText}>
                        💰 Earned: ₹{earnedIncome.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.incomeRow}>
                      <Text style={styles.borrowedIncomeText}>
                        ⚠️ Borrowed: ₹{borrowedIncome.toLocaleString('en-IN')}
                      </Text>
                      {incomeDetails?.source && (
                        <Text style={styles.borrowedSourceText}>
                          From: {incomeDetails.source}
                        </Text>
                      )}
                      {incomeDetails?.due_date && (
                        <Text style={styles.borrowedDueText}>
                          Due: {new Date(incomeDetails.due_date).toLocaleDateString('en-IN')}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Budget inclusion toggle */}
                {borrowedIncome > 0 && (
                  <View style={styles.budgetToggleContainer}>
                    <TouchableOpacity
                      style={styles.budgetToggle}
                      onPress={() => setIncludeBorrowedInBudget(!includeBorrowedInBudget)}
                    >
                      <View style={[
                        styles.toggleSwitch,
                        includeBorrowedInBudget && styles.toggleSwitchActive
                      ]}>
                        <View style={[
                          styles.toggleKnob,
                          includeBorrowedInBudget && styles.toggleKnobActive
                        ]} />
                      </View>
                      <Text style={styles.toggleText}>
                        Include borrowed funds in budget
                      </Text>
                    </TouchableOpacity>
                    {includeBorrowedInBudget && (
                      <Text style={styles.toggleWarning}>
                        ⚠️ You're including borrowed funds. Set a repayment goal!
                      </Text>
                    )}
                  </View>
                )}

                <Text style={{ color: "#888888", marginTop: 8 }}>
                  Remaining Budget: ₹{(totalAvailableIncome - totalAllocated).toLocaleString('en-IN')}
                </Text>
                <ProgressBar
                  progress={totalAvailableIncome ? totalAllocated / totalAvailableIncome : 0}
                  color="#A259FF"
                  style={{ marginTop: 8 }}
                />
                <Text style={{ color: "#A259FF", marginTop: 4 }}>
                  {totalAvailableIncome
                    ? `${Math.round(
                        (totalAllocated / totalAvailableIncome) * 100
                      )}% allocated `
                    : "Start by adding your income 💰"}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={{ flex: 1 }}>
            <FlatList
              data={getMainCategories()}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
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
              {/* Show parent category info when adding subcategory */}
              {form.parent_id && !form.id && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Parent Category</Text>
                  <View style={styles.parentCategoryInfo}>
                    <Text style={styles.parentCategoryName}>
                      {categories.find(cat => cat.id === form.parent_id)?.name}
                    </Text>
                    <Text style={styles.remainingBudgetText}>
                      Remaining Budget: ₹{getRemainingBudget(form.parent_id).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Parent Category Selection - Only show when adding main category */}
              {!form.id && !form.parent_id && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Parent Category (Optional)</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        !selectedParentCategory && styles.selectedCategoryChip
                      ]}
                      onPress={() => {
                        setSelectedParentCategory(null);
                        setForm({ ...form, parent_id: null });
                      }}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        !selectedParentCategory && styles.selectedCategoryChipText
                      ]}>
                        Main Category
                      </Text>
                    </TouchableOpacity>
                    {getMainCategories().map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          selectedParentCategory === cat.id && styles.selectedCategoryChip
                        ]}
                        onPress={() => {
                          setSelectedParentCategory(cat.id);
                          setForm({ ...form, parent_id: cat.id });
                        }}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          selectedParentCategory === cat.id && styles.selectedCategoryChipText
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

                <Text style={styles.formTitle}>
                  {form.id ? 'Edit Category' : 
                   form.parent_id ? 'Add Subcategory' : 'Add Category'}
                </Text>
                
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
                      setForm({ name: "", amount: "", id: null, parent_id: null });
                      setSelectedParentCategory(null);
                    }}
                    labelStyle={{ color: "#888888", fontWeight: "bold" }}
                  >
                    Cancel
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
                    setShowModal(true);
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
          setShowModal(false);
          navigation.navigate("Expense");
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
  mainCategoryCard: {
    borderColor: "#A259FF",
    borderWidth: 2,
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderColor: "#A259FF",
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A259FF',
    textAlign: 'center',
    marginBottom: 16,
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
    color: "#222222",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
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
  subcategoriesContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  subcategoryItem: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  subcategoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
  },
  subcategoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A259FF',
  },
  subcategoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F7F7F7',
    borderColor: '#A259FF',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedCategoryChip: {
    backgroundColor: '#A259FF',
  },
  categoryChipText: {
    color: '#222222',
    fontWeight: 'bold',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  parentCategoryInfo: {
    backgroundColor: '#F7F7F7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A259FF',
  },
  parentCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  remainingBudgetText: {
    fontSize: 14,
    color: '#A259FF',
    fontWeight: '600',
  },
  subcategoriesHeader: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subcategoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  incomeBreakdown: {
    marginBottom: 12,
  },
  incomeRow: {
    marginBottom: 4,
  },
  earnedIncomeText: {
    fontSize: 14,
    color: '#00AA00',
    fontWeight: '600',
  },
  borrowedIncomeText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  borrowedSourceText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 16,
    marginTop: 2,
  },
  borrowedDueText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 16,
    marginTop: 2,
    fontWeight: '500',
  },
  budgetToggleContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  budgetToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 2,
    marginRight: 12,
  },
  toggleSwitchActive: {
    backgroundColor: '#A259FF',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  toggleText: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '500',
  },
  toggleWarning: {
    fontSize: 12,
    color: '#FF6B35',
    fontStyle: 'italic',
  },
});

export default BudgetCategoriesScreen;
