<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  TextInput,
  Button,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "../lib/supabase";
import MainScreenWrapper from "../components/MainScreenWrapper";
=======
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, ActivityIndicator, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

export default function BudgetDetailsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(0);
<<<<<<< HEAD
  const [incomeDetails, setIncomeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    parent_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [includeBorrowedInBudget, setIncludeBorrowedInBudget] = useState(true);
=======
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', amount: '' });
  const [loading, setLoading] = useState(false);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserName(),
        fetchCategories(),
        fetchIncome(),
<<<<<<< HEAD
        fetchExpenses(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
=======
        fetchExpenses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserName = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
<<<<<<< HEAD
      .from("users")
      .select("name")
      .eq("id", user.data.user.id)
      .single();
    if (!error && data?.name) {
      setUserName(data.name.split(" ")[0]);
    } else {
      setUserName("User");
=======
      .from('users')
      .select('name')
      .eq('id', user.data.user.id)
      .single();
    if (!error && data?.name) {
      setUserName(data.name.split(' ')[0]);
    } else {
      setUserName('User');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    }
  };

  const fetchCategories = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
<<<<<<< HEAD
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: true });
    setCategories(data || []);
  };

  // Get main categories (no parent_id)
  const getMainCategories = () => {
    return categories.filter((cat) => !cat.parent_id);
  };

  // Get subcategories for a specific parent
  const getSubcategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  // Get category name with parent info
  const getCategoryDisplayName = (category) => {
    if (!category.parent_id) return category.name;

    const parentCat = categories.find((c) => c.id === category.parent_id);
    return parentCat ? `${parentCat.name} > ${category.name}` : category.name;
  };

  const fetchIncome = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("incomes")
      .select("amount, type, source, due_date")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false })
=======
      .from('budget_categories')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: true });
    setCategories(data || []);
  };

  const fetchIncome = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false })
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      .limit(1)
      .single();
    if (!error && data?.amount) {
      setIncome(data.amount);
<<<<<<< HEAD
      setIncomeDetails(data);
    } else {
      setIncome(0);
      setIncomeDetails(null);
=======
    } else {
      setIncome(0);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    }
  };

  const fetchExpenses = async () => {
    const user = await supabase.auth.getUser();
    const { data } = await supabase
<<<<<<< HEAD
      .from("expenses")
      .select("*")
      .eq("user_id", user.data.user.id);
=======
      .from('expenses')
      .select('*')
      .eq('user_id', user.data.user.id);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    setExpenses(data || []);
  };

  const calculateCategorySpending = (categoryId) => {
<<<<<<< HEAD
    // Get all subcategory IDs recursively
    const getAllSubcategoryIds = (parentId) => {
      const subcategories = categories.filter(
        (cat) => cat.parent_id === parentId
      );
      let allIds = [];
      subcategories.forEach((subcat) => {
        allIds.push(subcat.id);
        allIds = allIds.concat(getAllSubcategoryIds(subcat.id));
      });
      return allIds;
    };

    // Get the category ID and all its subcategory IDs
    const categoryIds = [categoryId, ...getAllSubcategoryIds(categoryId)];

    // Calculate total spending for the category and all its subcategories
    return expenses
      .filter((expense) => categoryIds.includes(expense.category_id))
=======
    return expenses
      .filter(expense => expense.category_id === categoryId)
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalAllocated = () => {
<<<<<<< HEAD
    // Calculate total allocation including only main categories (subcategories are divisions of main categories)
    return categories
      .filter((cat) => !cat.parent_id) // Only main categories
      .reduce((total, cat) => total + Number(cat.amount), 0);
=======
    return categories.reduce((total, cat) => total + Number(cat.amount), 0);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  };

  const getTotalSpent = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

<<<<<<< HEAD
  // Calculate earned and borrowed income
  const earnedIncome = incomeDetails?.type === "salary" ? income : 0;
  const borrowedIncome = incomeDetails?.type === "borrowed" ? income : 0;
  const totalAvailableIncome = includeBorrowedInBudget ? income : earnedIncome;

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", amount: "", parent_id: null });
    setSelectedParentCategory(null);
    setShowForm(true);
  };

  const handleAddSubcategory = (parentCategory) => {
    setEditingCategory(null);
    setFormData({ name: "", amount: "", parent_id: parentCategory.id });
    setSelectedParentCategory(parentCategory.id);
    setShowForm(true);
  };

  // Calculate remaining budget for a category
  const getRemainingBudget = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return 0;

    const allocated = Number(category.amount);

    // Calculate total amount already allocated to subcategories
    const subcategories = getSubcategories(categoryId);
    const subcategoriesTotal = subcategories.reduce(
      (sum, subcat) => sum + Number(subcat.amount),
      0
    );

    // Calculate total spent in this category and its subcategories
    const spent = calculateCategorySpending(categoryId);

    // Remaining budget = allocated - subcategories total - spent
    return Math.max(0, allocated - subcategoriesTotal - spent);
  };

=======
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', amount: '' });
    setShowForm(true);
  };

>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
<<<<<<< HEAD
      amount: category.amount.toString(),
      parent_id: category.parent_id,
    });
    setSelectedParentCategory(category.parent_id);
    setShowForm(true);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteAction, setDeleteAction] = useState(""); // 'delete' or 'move'
  const [targetCategory, setTargetCategory] = useState("");

  const handleDeleteCategory = async (category) => {
    setCategoryToDelete(category);
    setDeleteAction("");
    setTargetCategory("");

    // Check if category or its subcategories have any expenses
    const hasExpenses = await checkCategoryExpenses(category.id);

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
          {
            text: "Delete",
            style: "destructive",
            onPress: () => confirmDeleteCategorySimple(),
          },
        ]
      );
    }
  };

  const checkCategoryExpenses = async (categoryId) => {
    try {
      // Get all subcategory IDs recursively
      const getAllSubcategoryIds = (parentId) => {
        const subcategories = categories.filter(
          (cat) => cat.parent_id === parentId
        );
        let allIds = [];
        subcategories.forEach((subcat) => {
          allIds.push(subcat.id);
          allIds = allIds.concat(getAllSubcategoryIds(subcat.id));
        });
        return allIds;
      };

      const categoryIds = [categoryId, ...getAllSubcategoryIds(categoryId)];

      // Check if any of these categories have expenses
      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("id")
        .in("category_id", categoryIds)
        .limit(1);

      if (error) {
        console.error("Error checking expenses:", error);
        return false;
      }

      return expenses && expenses.length > 0;
    } catch (error) {
      console.error("Error checking category expenses:", error);
      return false;
    }
  };

  const confirmDeleteCategorySimple = async () => {
    if (categoryToDelete) {
      try {
        // Delete all expenses in this category first
        await supabase
          .from("expenses")
          .delete()
          .eq("category_id", categoryToDelete.id);
        // Also delete all subcategories
        await supabase
          .from("budget_categories")
          .delete()
          .eq("parent_id", categoryToDelete.id);
        // Then delete the category
        await supabase
          .from("budget_categories")
          .delete()
          .eq("id", categoryToDelete.id);

        setCategoryToDelete(null);
        loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
        Alert.alert("Error", "Failed to delete category. Please try again.");
      }
    }
  };

  const confirmDeleteCategory = async () => {
    if (deleteAction === "move" && !targetCategory) {
      Alert.alert(
        "Error",
        "Please select a target category to move expenses to."
      );
      return;
    }

    try {
      if (deleteAction === "delete") {
        // Delete all expenses in this category first
        await supabase
          .from("expenses")
          .delete()
          .eq("category_id", categoryToDelete.id);
        // Also delete all subcategories
        await supabase
          .from("budget_categories")
          .delete()
          .eq("parent_id", categoryToDelete.id);
        // Then delete the category
        await supabase
          .from("budget_categories")
          .delete()
          .eq("id", categoryToDelete.id);
      } else if (deleteAction === "move") {
        // Move all expenses to target category
        await supabase
          .from("expenses")
          .update({ category_id: targetCategory })
          .eq("category_id", categoryToDelete.id);
        // Then delete the category
        await supabase
          .from("budget_categories")
          .delete()
          .eq("id", categoryToDelete.id);
      }

      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setDeleteAction("");
      setTargetCategory("");
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert("Error", "Failed to delete category. Please try again.");
    }
  };

  const handleAddOrEditCategory = async () => {
    if (
      !formData.name ||
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      Alert.alert("Error", "Please enter both name and a valid amount.");
=======
      amount: category.amount.toString()
    });
    setShowForm(true);
  };



  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteAction, setDeleteAction] = useState(''); // 'delete' or 'move'
  const [targetCategory, setTargetCategory] = useState('');

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteAction('');
    setTargetCategory('');
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (deleteAction === 'move' && !targetCategory) {
      Alert.alert('Error', 'Please select a target category to move expenses to.');
      return;
    }

    if (deleteAction === 'delete') {
      // Delete all expenses in this category first
      await supabase.from('expenses').delete().eq('category_id', categoryToDelete.id);
      // Then delete the category
      await supabase.from('budget_categories').delete().eq('id', categoryToDelete.id);
    } else if (deleteAction === 'move') {
      // Move all expenses to target category
      await supabase.from('expenses').update({ category_id: targetCategory }).eq('category_id', categoryToDelete.id);
      // Then delete the category
      await supabase.from('budget_categories').delete().eq('id', categoryToDelete.id);
    }

    setShowDeleteModal(false);
    setCategoryToDelete(null);
    setDeleteAction('');
    setTargetCategory('');
    loadData();
  };

  const handleAddOrEditCategory = async () => {
    if (!formData.name || !formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter both name and a valid amount.');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      return;
    }

    const newAmount = Number(formData.amount);
<<<<<<< HEAD

    // Calculate current total allocation (main categories only)
    const currentTotal = getTotalAllocated();
    const editingAmount = editingCategory ? Number(editingCategory.amount) : 0;

    // For main categories, check against total available income
    if (!formData.parent_id) {
      const newTotalAllocation = currentTotal - editingAmount + newAmount;
      if (newTotalAllocation > totalAvailableIncome) {
        Alert.alert(
          "Error",
          `Total allocation (₹${newTotalAllocation.toLocaleString(
            "en-IN"
          )}) would exceed your available income (₹${totalAvailableIncome.toLocaleString(
            "en-IN"
          )})!`
        );
        return;
      }
    }

    // If adding or editing a subcategory, check against remaining budget of parent
    if (formData.parent_id) {
      const remainingBudget = getRemainingBudget(formData.parent_id);
      if (newAmount > remainingBudget) {
        Alert.alert(
          "Error",
          `Amount cannot exceed remaining budget of ₹${remainingBudget.toLocaleString(
            "en-IN"
          )}`
        );
        return;
      }
=======
    const currentTotal = getTotalAllocated();
    const editingAmount = editingCategory ? Number(editingCategory.amount) : 0;
    
    if (currentTotal - editingAmount + newAmount > income) {
      Alert.alert('Error', 'Total allocation would exceed your income!');
      return;
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    }

    setLoading(true);
    const user = await supabase.auth.getUser();

    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
<<<<<<< HEAD
        .from("budget_categories")
        .update({
          name: formData.name,
          amount: newAmount,
          parent_id: formData.parent_id,
        })
        .eq("id", editingCategory.id);

      if (error) {
        Alert.alert("Error", "Failed to update category. Try again.");
=======
        .from('budget_categories')
        .update({ name: formData.name, amount: newAmount })
        .eq('id', editingCategory.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to update category. Try again.');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        setLoading(false);
        return;
      }
    } else {
      // Add new category
<<<<<<< HEAD
      const { error } = await supabase.from("budget_categories").insert([
        {
          user_id: user.data.user.id,
          name: formData.name,
          amount: newAmount,
          parent_id: formData.parent_id,
        },
      ]);

      if (error) {
        Alert.alert("Error", "Failed to add category. Try again.");
=======
      const { error } = await supabase
        .from('budget_categories')
        .insert([{ 
          user_id: user.data.user.id, 
          name: formData.name, 
          amount: newAmount 
        }]);
      
      if (error) {
        Alert.alert('Error', 'Failed to add category. Try again.');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        setLoading(false);
        return;
      }
    }
<<<<<<< HEAD

    setLoading(false);
    setShowForm(false);
    setFormData({ name: "", amount: "" });
=======
    
    setLoading(false);
    setShowForm(false);
    setFormData({ name: '', amount: '' });
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    setEditingCategory(null);
    loadData();
  };

  if (isLoading) {
    return (
<<<<<<< HEAD
      <MainScreenWrapper navigation={navigation} currentRoute="BudgetDetails">
=======
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={styles.loadingText}>Loading your budget details...</Text>
        </View>
<<<<<<< HEAD
      </MainScreenWrapper>
=======
      </SafeAreaView>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    );
  }

  return (
<<<<<<< HEAD
    <MainScreenWrapper navigation={navigation} currentRoute="BudgetDetails">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 50,
        }}
        keyboardVerticalOffset={64}
      >
=======
    
    
      <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={64}
    >
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Details</Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Total Overview</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
<<<<<<< HEAD
                <Text style={styles.summaryValue}>
                  ₹{income.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Allocated</Text>
                <Text style={styles.summaryValue}>
                  ₹{getTotalAllocated().toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={styles.summaryValue}>
                  ₹{getTotalSpent().toLocaleString("en-IN")}
                </Text>
=======
                <Text style={styles.summaryValue}>₹{income.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Allocated</Text>
                <Text style={styles.summaryValue}>₹{getTotalAllocated().toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={styles.summaryValue}>₹{getTotalSpent().toLocaleString('en-IN')}</Text>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
<<<<<<< HEAD
            <TouchableOpacity
=======
            <TouchableOpacity 
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
              style={styles.addButton}
              onPress={handleAddCategory}
            >
              <Icon name="plus" size={20} color="#A259FF" />
            </TouchableOpacity>
          </View>
          <FlatList
<<<<<<< HEAD
            data={getMainCategories()}
=======
            data={categories}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const spent = calculateCategorySpending(item.id);
              const remaining = Number(item.amount) - spent;
<<<<<<< HEAD
              const spentPercentage =
                Number(item.amount) > 0
                  ? (spent / Number(item.amount)) * 100
                  : 0;
              const subcategories = getSubcategories(item.id);

              return (
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("CategoryExpenseHistory", {
                        categoryId: item.id,
                        categoryName: item.name,
                        allocatedAmount: Number(item.amount),
                      })
                    }
                  >
                    <Card
                      style={[styles.categoryCard, styles.mainCategoryCard]}
                    >
                      <Card.Content>
                        <View style={styles.categoryHeader}>
                          <View>
                            <Text
                              style={[
                                styles.categoryName,
                                styles.mainCategoryName,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.categoryAmount}>
                              ₹{Number(item.amount).toLocaleString("en-IN")}
                            </Text>
                          </View>
                          <View style={styles.categoryActions}>
                            <TouchableOpacity
                              onPress={() => handleAddSubcategory(item)}
                              style={{ marginRight: 8 }}
                            >
                              <Icon name="plus" size={20} color="#A259FF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleEditCategory(item)}
                              style={{ marginRight: 8 }}
                            >
                              <Icon name="pencil" size={20} color="#A259FF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteCategory(item)}
                            >
                              <Icon name="delete" size={20} color="#EB5757" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.spendingRow}>
                          <View style={styles.spendingItem}>
                            <Text style={styles.spendingLabel}>Spent</Text>
                            <Text style={styles.spendingValue}>
                              ₹{spent.toLocaleString("en-IN")}
                            </Text>
                          </View>
                          <View style={styles.spendingItem}>
                            <Text style={styles.spendingLabel}>Remaining</Text>
                            <Text
                              style={[
                                styles.spendingValue,
                                remaining < 0 && styles.overspent,
                              ]}
                            >
                              ₹{remaining.toLocaleString("en-IN")}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.min(spentPercentage, 100)}%` },
                                spentPercentage > 100 &&
                                  styles.progressOverspent,
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {Math.round(spentPercentage)}% used
                          </Text>
                        </View>

                        {/* Subcategories nested within parent card */}
                        {subcategories.length > 0 && (
                          <View style={styles.subcategoriesContainer}>
                            <View style={styles.subcategoriesHeader}>
                              <Text style={styles.subcategoriesTitle}>
                                Subcategories
                              </Text>
                            </View>
                            {subcategories.map((subcat) => {
                              const subSpent = calculateCategorySpending(
                                subcat.id
                              );
                              const subRemaining =
                                Number(subcat.amount) - subSpent;
                              const subSpentPercentage =
                                Number(subcat.amount) > 0
                                  ? (subSpent / Number(subcat.amount)) * 100
                                  : 0;

                              return (
                                <TouchableOpacity
                                  key={subcat.id}
                                  onPress={() =>
                                    navigation.navigate(
                                      "CategoryExpenseHistory",
                                      {
                                        categoryId: subcat.id,
                                        categoryName:
                                          getCategoryDisplayName(subcat),
                                        allocatedAmount: Number(subcat.amount),
                                      }
                                    )
                                  }
                                >
                                  <View style={styles.subcategoryItem}>
                                    <View style={styles.subcategoryInfo}>
                                      <Text style={styles.subcategoryName}>
                                        {subcat.name}
                                      </Text>
                                      <Text style={styles.subcategoryAmount}>
                                        ₹
                                        {Number(subcat.amount).toLocaleString(
                                          "en-IN"
                                        )}
                                      </Text>
                                    </View>
                                    <View style={styles.subcategoryActions}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleEditCategory(subcat)
                                        }
                                        style={{ marginRight: 8 }}
                                      >
                                        <Icon
                                          name="pencil"
                                          size={16}
                                          color="#A259FF"
                                        />
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleDeleteCategory(subcat)
                                        }
                                      >
                                        <Icon
                                          name="delete"
                                          size={16}
                                          color="#EB5757"
                                        />
                                      </TouchableOpacity>
                                    </View>

                                    <View style={styles.subcategorySpendingRow}>
                                      <View
                                        style={styles.subcategorySpendingItem}
                                      >
                                        <Text
                                          style={
                                            styles.subcategorySpendingLabel
                                          }
                                        >
                                          Spent
                                        </Text>
                                        <Text
                                          style={
                                            styles.subcategorySpendingValue
                                          }
                                        >
                                          ₹{subSpent.toLocaleString("en-IN")}
                                        </Text>
                                      </View>
                                      <View
                                        style={styles.subcategorySpendingItem}
                                      >
                                        <Text
                                          style={
                                            styles.subcategorySpendingLabel
                                          }
                                        >
                                          Remaining
                                        </Text>
                                        <Text
                                          style={[
                                            styles.subcategorySpendingValue,
                                            subRemaining < 0 &&
                                              styles.overspent,
                                          ]}
                                        >
                                          ₹
                                          {subRemaining.toLocaleString("en-IN")}
                                        </Text>
                                      </View>
                                    </View>

                                    <View
                                      style={
                                        styles.subcategoryProgressContainer
                                      }
                                    >
                                      <View
                                        style={styles.subcategoryProgressBar}
                                      >
                                        <View
                                          style={[
                                            styles.subcategoryProgressFill,
                                            {
                                              width: `${Math.min(
                                                subSpentPercentage,
                                                100
                                              )}%`,
                                            },
                                            subSpentPercentage > 100 &&
                                              styles.progressOverspent,
                                          ]}
                                        />
                                      </View>
                                      <Text
                                        style={styles.subcategoryProgressText}
                                      >
                                        {Math.round(subSpentPercentage)}% used
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>

                  {/* Remove the old separate subcategory cards */}
                </View>
              );
            }}
            style={{ marginBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 55 }}
=======
              const spentPercentage = Number(item.amount) > 0 ? (spent / Number(item.amount)) * 100 : 0;

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CategoryExpenseHistory', {
                    categoryId: item.id,
                    categoryName: item.name,
                    allocatedAmount: Number(item.amount)
                  })}
                >
                  <Card style={styles.categoryCard}>
                  <Card.Content>
                    <View style={styles.categoryHeader}>
                      <View>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryAmount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.categoryActions}>
                                        <TouchableOpacity onPress={() => handleEditCategory(item)} style={{ marginRight: 8 }}>
                  <Icon name="pencil" size={20} color="#A259FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
                  <Icon name="delete" size={20} color="#EB5757" />
                </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.spendingRow}>
                      <View style={styles.spendingItem}>
                        <Text style={styles.spendingLabel}>Spent</Text>
                        <Text style={styles.spendingValue}>₹{spent.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={styles.spendingItem}>
                        <Text style={styles.spendingLabel}>Remaining</Text>
                        <Text style={[styles.spendingValue, remaining < 0 && styles.overspent]}>
                          ₹{remaining.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${Math.min(spentPercentage, 100)}%` },
                            spentPercentage > 100 && styles.progressOverspent
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{Math.round(spentPercentage)}% used</Text>
                    </View>
                  </Card.Content>
                </Card>
                </TouchableOpacity>
              );
            }}
            style={{ marginBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 16 }}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
          />
        </View>

        {/* Add/Edit Category Form */}
        {showForm && (
          <Card style={styles.formCard}>
            <Card.Content>
<<<<<<< HEAD
              <Text style={styles.formTitle}>
                {editingCategory
                  ? "Edit Category"
                  : formData.parent_id
                  ? "Add Subcategory"
                  : "Add Category"}
              </Text>

              {/* Show parent category info when adding subcategory */}
              {formData.parent_id && !editingCategory && (
                <View style={{ marginBottom: 16 }}>
                  <View style={styles.parentCategoryInfo}>
                    <Text style={styles.parentCategoryName}>
                      {
                        categories.find((cat) => cat.id === formData.parent_id)
                          ?.name
                      }
                    </Text>
                    <Text style={styles.remainingBudgetText}>
                      Remaining Budget: ₹
                      {getRemainingBudget(formData.parent_id).toLocaleString(
                        "en-IN"
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* Parent Category Selection - Only show when adding main category */}
              {/* {!editingCategory && !formData.parent_id && (
                <View style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        !selectedParentCategory && styles.selectedCategoryChip,
                      ]}
                      onPress={() => {
                        setSelectedParentCategory(null);
                        setFormData({ ...formData, parent_id: null });
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          !selectedParentCategory &&
                            styles.selectedCategoryChipText,
                        ]}
                      >
                        Main Category
                      </Text>
                    </TouchableOpacity>
                    {getMainCategories().map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          selectedParentCategory === cat.id &&
                            styles.selectedCategoryChip,
                        ]}
                        onPress={() => {
                          setSelectedParentCategory(cat.id);
                          setFormData({ ...formData, parent_id: cat.id });
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedParentCategory === cat.id &&
                              styles.selectedCategoryChipText,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )} */}

              {/* Only adding main categories */}
              {/* {!editingCategory && (
                <View style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[styles.categoryChip, styles.selectedCategoryChip]}
                    onPress={() =>
                      setFormData({ ...formData, parent_id: null })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        styles.selectedCategoryChipText,
                      ]}
                    >
                      Main Category
                    </Text>
                  </TouchableOpacity>
                </View>
              )} */}

              <TextInput
                label="Category Name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
=======
              <Text style={styles.formTitle}>{editingCategory ? 'Edit Category' : 'Add Category'}</Text>
              
              <TextInput
                label="Category Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
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
                value={formData.amount}
<<<<<<< HEAD
                onChangeText={(text) =>
                  setFormData({ ...formData, amount: text })
                }
=======
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
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

<<<<<<< HEAD
              <View style={{ flexDirection: "row", marginTop: 16 }}>
=======
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                <Button
                  mode="contained"
                  onPress={handleAddOrEditCategory}
                  style={styles.saveButton}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  loading={loading}
                >
<<<<<<< HEAD
                  {loading
                    ? editingCategory
                      ? "Updating..."
                      : "Adding..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
=======
                  {loading ? (editingCategory ? "Updating..." : "Adding...") : (editingCategory ? "Update Category" : "Add Category")}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                </Button>
                <View style={{ width: 12 }} />
                <Button
                  mode="outlined"
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
<<<<<<< HEAD
                    setFormData({ name: "", amount: "", parent_id: null });
                    setEditingCategory(null);
                    setSelectedParentCategory(null);
=======
                    setFormData({ name: '', amount: '' });
                    setEditingCategory(null);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                  }}
                  labelStyle={{ color: "#888888", fontWeight: "bold" }}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Enhanced Delete Category Modal */}
        {showDeleteModal && (
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <Text style={styles.deleteModalTitle}>Delete Category</Text>
              <Text style={styles.deleteModalSubtitle}>
                Are you sure you want to delete "{categoryToDelete?.name}"?
              </Text>
              <Text style={styles.deleteModalWarning}>
                ⚠️ This will also affect all expenses in this category.
              </Text>

              <View style={styles.deleteOptions}>
                <TouchableOpacity
                  style={[
                    styles.deleteOption,
<<<<<<< HEAD
                    deleteAction === "delete" && styles.selectedDeleteOption,
                  ]}
                  onPress={() => setDeleteAction("delete")}
                >
                  <Text
                    style={[
                      styles.deleteOptionText,
                      deleteAction === "delete" &&
                        styles.selectedDeleteOptionText,
                    ]}
                  >
=======
                    deleteAction === 'delete' && styles.selectedDeleteOption
                  ]}
                  onPress={() => setDeleteAction('delete')}
                >
                  <Text style={[
                    styles.deleteOptionText,
                    deleteAction === 'delete' && styles.selectedDeleteOptionText
                  ]}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                    Delete all expenses
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteOption,
<<<<<<< HEAD
                    deleteAction === "move" && styles.selectedDeleteOption,
                  ]}
                  onPress={() => setDeleteAction("move")}
                >
                  <Text
                    style={[
                      styles.deleteOptionText,
                      deleteAction === "move" &&
                        styles.selectedDeleteOptionText,
                    ]}
                  >
=======
                    deleteAction === 'move' && styles.selectedDeleteOption
                  ]}
                  onPress={() => setDeleteAction('move')}
                >
                  <Text style={[
                    styles.deleteOptionText,
                    deleteAction === 'move' && styles.selectedDeleteOptionText
                  ]}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                    Move expenses to another category
                  </Text>
                </TouchableOpacity>
              </View>

<<<<<<< HEAD
              {deleteAction === "move" && (
                <View style={styles.targetCategorySection}>
                  <Text style={styles.targetCategoryLabel}>
                    Select target category:
                  </Text>
                  <View style={styles.targetCategoryList}>
                    {categories
                      .filter((cat) => cat.id !== categoryToDelete?.id)
=======


              {deleteAction === 'move' && (
                <View style={styles.targetCategorySection}>
                  <Text style={styles.targetCategoryLabel}>Select target category:</Text>
                  <View style={styles.targetCategoryList}>
                    {categories
                      .filter(cat => cat.id !== categoryToDelete?.id)
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                      .map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.targetCategoryOption,
<<<<<<< HEAD
                            targetCategory === cat.id &&
                              styles.selectedTargetCategory,
                          ]}
                          onPress={() => setTargetCategory(cat.id)}
                        >
                          <Text
                            style={[
                              styles.targetCategoryOptionText,
                              targetCategory === cat.id &&
                                styles.selectedTargetCategoryText,
                            ]}
                          >
=======
                            targetCategory === cat.id && styles.selectedTargetCategory
                          ]}
                          onPress={() => setTargetCategory(cat.id)}
                        >
                          <Text style={[
                            styles.targetCategoryOptionText,
                            targetCategory === cat.id && styles.selectedTargetCategoryText
                          ]}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
<<<<<<< HEAD
                    setDeleteAction("");
                    setTargetCategory("");
=======
                    setDeleteAction('');
                    setTargetCategory('');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                  }}
                >
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmDeleteButton,
<<<<<<< HEAD
                    !deleteAction && styles.disabledDeleteButton,
=======
                    !deleteAction && styles.disabledDeleteButton
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                  ]}
                  onPress={confirmDeleteCategory}
                  disabled={!deleteAction}
                >
<<<<<<< HEAD
                  <Text
                    style={[
                      styles.confirmDeleteText,
                      !deleteAction && styles.disabledDeleteText,
                    ]}
                  >
                    {deleteAction === "move" ? "Move & Delete" : "Delete"}
=======
                  <Text style={[
                    styles.confirmDeleteText,
                    !deleteAction && styles.disabledDeleteText
                  ]}>
                    {deleteAction === 'move' ? 'Move & Delete' : 'Delete'}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
<<<<<<< HEAD
        {/* </SafeAreaView> */}
      </KeyboardAvoidingView>
    </MainScreenWrapper>
=======
      {/* </SafeAreaView> */}

     
    </KeyboardAvoidingView>
     {/* Footer Navigation Bar */}
     <View style={styles.footerNav}>
     <TouchableOpacity style={styles.footerNavItem} onPress={() => navigation.navigate('Expense')}>
       <Icon name="credit-card-outline" size={26} color="#888888" />
       <Text style={styles.footerNavLabel}>Expenses</Text>
     </TouchableOpacity>
     <TouchableOpacity style={styles.footerNavItem}>
       <Icon name="chart-pie" size={26} color="#A259FF" />
       <Text style={styles.footerNavLabelActive}>Budgets</Text>
     </TouchableOpacity>
     <TouchableOpacity style={styles.footerNavItem}>
       <Icon name="chart-bar" size={26} color="#888888" />
       <Text style={styles.footerNavLabel}>Reports</Text>
     </TouchableOpacity>
   </View>
   </SafeAreaView>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
=======
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
<<<<<<< HEAD
    color: "#888888",
    fontWeight: "600",
=======
    color: '#888888',
    fontWeight: '600',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 28,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#222222",
=======
    fontWeight: 'bold',
    color: '#222222',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
<<<<<<< HEAD
    color: "#888888",
=======
    color: '#888888',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  summaryCard: {
    marginBottom: 20,
    marginHorizontal: 4,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    elevation: 2,
    borderColor: "#E0E0E0",
=======
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    elevation: 2,
    borderColor: '#E0E0E0',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
=======
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
<<<<<<< HEAD
    color: "#888888",
=======
    color: '#888888',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#A259FF",
=======
    fontWeight: 'bold',
    color: '#A259FF',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  categoriesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
=======
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 12,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#A259FF",
=======
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#A259FF',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  categoryCard: {
    marginBottom: 12,
    marginHorizontal: 4,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    elevation: 2,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  mainCategoryCard: {
    borderColor: "#A259FF",
    borderWidth: 2,
  },
  subcategoryCard: {
    marginLeft: 20,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },
  mainCategoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222222",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A259FF",
  },
  spendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  spendingItem: {
    alignItems: "center",
=======
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    elevation: 2,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A259FF',
  },
  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spendingItem: {
    alignItems: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    flex: 1,
  },
  spendingLabel: {
    fontSize: 12,
<<<<<<< HEAD
    color: "#888888",
=======
    color: '#888888',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 2,
  },
  spendingValue: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#222222",
  },
  overspent: {
    color: "#EB5757",
=======
    fontWeight: 'bold',
    color: '#222222',
  },
  overspent: {
    color: '#EB5757',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
<<<<<<< HEAD
    backgroundColor: "#E0E0E0",
=======
    backgroundColor: '#E0E0E0',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
<<<<<<< HEAD
    height: "100%",
    backgroundColor: "#A259FF",
    borderRadius: 3,
  },
  progressOverspent: {
    backgroundColor: "#EB5757",
  },
  progressText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },

  formCard: {
    marginBottom: 70,
    marginHorizontal: 4,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderColor: "#A259FF",
=======
    height: '100%',
    backgroundColor: '#A259FF',
    borderRadius: 3,
  },
  progressOverspent: {
    backgroundColor: '#EB5757',
  },
  progressText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  footerNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNavLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  footerNavLabelActive: {
    fontSize: 12,
    color: '#A259FF',
    marginTop: 2,
    fontWeight: '700',
  },
  formCard: {
    marginBottom: 16,
    marginHorizontal: 4,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    borderColor: '#A259FF',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
<<<<<<< HEAD
    fontWeight: "bold",
    color: "#A259FF",
    textAlign: "center",
=======
    fontWeight: 'bold',
    color: '#A259FF',
    textAlign: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
<<<<<<< HEAD
    backgroundColor: "#FFFFFF",
    borderColor: "#A259FF",
    color: "#222222",
=======
    backgroundColor: '#FFFFFF',
    borderColor: '#A259FF',
    color: '#222222',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    borderWidth: 1,
    borderRadius: 8,
  },
  saveButton: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: "#A259FF",
=======
    backgroundColor: '#A259FF',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    borderRadius: 10,
  },
  cancelButton: {
    flex: 1,
<<<<<<< HEAD
    borderColor: "#888888",
    borderRadius: 10,
  },
  deleteModalOverlay: {
    position: "absolute",
=======
    borderColor: '#888888',
    borderRadius: 10,
  },
  deleteModalOverlay: {
    position: 'absolute',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
<<<<<<< HEAD
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  deleteModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
=======
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 8,
  },
  deleteModalSubtitle: {
    fontSize: 16,
<<<<<<< HEAD
    color: "#222222",
    textAlign: "center",
=======
    color: '#222222',
    textAlign: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    marginBottom: 8,
  },
  deleteModalWarning: {
    fontSize: 14,
<<<<<<< HEAD
    color: "#EB5757",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
=======
    color: '#EB5757',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  deleteOptions: {
    marginBottom: 20,
  },
  deleteOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedDeleteOption: {
    backgroundColor: "#A259FF",
    borderColor: "#A259FF",
  },
  deleteOptionText: {
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
  },
  selectedDeleteOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
=======
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDeleteOption: {
    backgroundColor: '#A259FF',
    borderColor: '#A259FF',
  },
  deleteOptionText: {
    fontSize: 14,
    color: '#222222',
    textAlign: 'center',
  },
  selectedDeleteOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  targetCategorySection: {
    marginBottom: 20,
  },
  targetCategoryLabel: {
    fontSize: 14,
<<<<<<< HEAD
    color: "#222222",
    marginBottom: 8,
    fontWeight: "600",
=======
    color: '#222222',
    marginBottom: 8,
    fontWeight: '600',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  targetCategoryList: {
    maxHeight: 120,
  },
  targetCategoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedTargetCategory: {
    backgroundColor: "#A259FF",
    borderColor: "#A259FF",
  },
  targetCategoryOptionText: {
    fontSize: 12,
    color: "#222222",
    textAlign: "center",
  },
  selectedTargetCategoryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
=======
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTargetCategory: {
    backgroundColor: '#A259FF',
    borderColor: '#A259FF',
  },
  targetCategoryOptionText: {
    fontSize: 12,
    color: '#222222',
    textAlign: 'center',
  },
  selectedTargetCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
<<<<<<< HEAD
    borderColor: "#E0E0E0",
    marginRight: 8,
    alignItems: "center",
=======
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
<<<<<<< HEAD
    backgroundColor: "#EB5757",
    marginLeft: 8,
    alignItems: "center",
  },
  cancelDeleteText: {
    color: "#888888",
    fontWeight: "600",
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledDeleteButton: {
    backgroundColor: "#CCCCCC",
  },
  disabledDeleteText: {
    color: "#888888",
  },
  label: {
    color: "#222222",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
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
  selectedCategoryChip: {
    backgroundColor: "#A259FF",
  },
  categoryChipText: {
    color: "#222222",
    fontWeight: "bold",
  },
  selectedCategoryChipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  parentCategoryInfo: {
    backgroundColor: "#F7F7F7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A259FF",
  },
  parentCategoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 4,
  },
  remainingBudgetText: {
    fontSize: 14,
    color: "#A259FF",
    fontWeight: "600",
  },
  subcategoryItem: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
  },
  subcategoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222222",
  },
  subcategoryAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#A259FF",
  },
  subcategoryActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subcategorySpendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subcategorySpendingItem: {
    alignItems: "center",
    flex: 1,
  },
  subcategorySpendingLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 2,
  },
  subcategorySpendingValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222222",
  },
  subcategoryProgressContainer: {
    marginTop: 4,
  },
  subcategoryProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 4,
  },
  subcategoryProgressFill: {
    height: "100%",
    backgroundColor: "#A259FF",
    borderRadius: 3,
  },
  subcategoryProgressText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
  subcategoriesContainer: {
    marginTop: 12,
  },
  subcategoriesHeader: {
    backgroundColor: "#F7F7F7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
  },
  subcategoriesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222222",
  },
});
=======
    backgroundColor: '#EB5757',
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelDeleteText: {
    color: '#888888',
    fontWeight: '600',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledDeleteButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledDeleteText: {
    color: '#888888',
  },


}); 
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
