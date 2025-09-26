<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, SectionList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, FAB, Title, Paragraph, Modal, Portal, Button, TextInput, Appbar, Divider, Chip, ActivityIndicator, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

export default function ExpenseScreen({ navigation }) {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
<<<<<<< HEAD
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
=======
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [income, setIncome] = useState(0);
  const [showDropDown, setShowDropDown] = useState(false);
  const categoryList = categories.map(cat => ({ label: cat.name, value: cat.id }));
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditExpense = (expense) => {
    setSelectedCategory(expense.category_id);
<<<<<<< HEAD
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description || "",
    });
=======
    setAmount(expense.amount.toString());
    setDescription(expense.description || '');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    setShowForm(true);
    setEditingExpenseId(expense.id);
  };

  const handleDeleteExpense = (expenseId) => {
<<<<<<< HEAD
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

=======
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('expenses').delete().eq('id', expenseId);
        fetchExpenses();
      }},
    ]);
  };



>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  const quotes = [
    "A penny saved is a penny earned.",
    "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
    "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
    "The art is not in making money, but in keeping it.",
    "Save money and money will save you.",
    "It’s not your salary that makes you rich, it’s your spending habits.",
    "Don’t tell me what you value, show me your budget, and I’ll tell you what you value. – Joe Biden",
    "The quickest way to double your money is to fold it in half and put it in your back pocket.",
<<<<<<< HEAD
    "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
  ];

  const [quote, setQuote] = useState("");
=======
    "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey"
  ];

  const [quote, setQuote] = useState('');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db

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
<<<<<<< HEAD

=======
    
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    loadAllData();
  }, []);

  useEffect(() => {
    if (showForm && categories.length > 0) {
<<<<<<< HEAD
      const found = categories.find((cat) => cat.id === selectedCategory);
=======
      const found = categories.find(cat => cat.id === selectedCategory);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      if (!found) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [showForm, categories]);

  const fetchUserName = async (retry = 0) => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
<<<<<<< HEAD
      .from("users")
      .select("name")
      .eq("id", user.data.user.id)
      .single();
    if (!error && data && data.name && data.name.trim()) {
      const firstName = data.name.trim().split(" ")[0];
=======
      .from('users')
      .select('name')
      .eq('id', user.data.user.id)
      .single();
    if (!error && data && data.name && data.name.trim()) {
      const firstName = data.name.trim().split(' ')[0];
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      setUserName(firstName);
    } else if (retry < 3) {
      setTimeout(() => fetchUserName(retry + 1), 700);
    } else {
<<<<<<< HEAD
      setUserName("User");
=======
      setUserName('User');
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
<<<<<<< HEAD
      .from("budget_categories")
      .select("id, name, parent_id")
      .order("created_at", { ascending: true });
    if (!error && data && data.length > 0) {
      setCategories(data);
      // Set first main category as default
      const mainCategories = data.filter((cat) => !cat.parent_id);
      if (mainCategories.length > 0) {
        setSelectedCategory(mainCategories[0].id);
      }
=======
      .from('budget_categories')
      .select('id, name');
    if (!error && data && data.length > 0) {
      setCategories(data);
      setSelectedCategory(data[0].id);
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    } else {
      setCategories([]);
      setSelectedCategory("");
    }
  };

<<<<<<< HEAD
  // Get main categories (no parent_id)
  const getMainCategories = () => {
    return categories.filter((cat) => !cat.parent_id);
  };

  // Get subcategories for a specific parent
  const getSubcategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
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
=======
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
    if (!error && data && data.amount) {
      setIncome(data.amount);
    } else {
      setIncome(0);
    }
  };

  const fetchExpenses = async () => {
    const user = await supabase.auth.getUser();
    const { data } = await supabase
<<<<<<< HEAD
      .from("expenses")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });
=======
      .from('expenses')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    setExpenses(data || []);
  };

  // Remove this useEffect since fetchExpenses is now called in loadAllData

  const handleAddOrEditExpense = async () => {
<<<<<<< HEAD
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
=======
    if (!selectedCategory || !amount || isNaN(amount) || Number(amount) <= 0) {
      Toast.show({ type: 'error', text1: 'Please select a category and enter a valid amount.' });
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
      return;
    }
    setLoading(true);
    const user = await supabase.auth.getUser();
<<<<<<< HEAD
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
=======
    
    if (editingExpenseId) {
      // Update existing expense
      const { error } = await supabase
        .from('expenses')
        .update({ category_id: selectedCategory, amount: Number(amount), description })
        .eq('id', editingExpenseId);
      
      if (error) {
        Toast.show({ type: 'error', text1: 'Failed to update expense. Try again.' });
        setLoading(false);
        return;
      }
      Toast.show({ type: 'success', text1: 'Expense updated!' });
    } else {
      // Add new expense
    const { error } = await supabase
      .from('expenses')
      .insert([{ user_id: user.data.user.id, category_id: selectedCategory, amount: Number(amount), description }]);
      
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to log expense. Try again.' });
        setLoading(false);
      return;
      }
      Toast.show({ type: 'success', text1: 'Expense logged!' });
    }
    
    setLoading(false);
    setShowForm(false);
    setAmount("");
    setDescription("");
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
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
<<<<<<< HEAD
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
=======
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const formatSectionDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupExpensesByDate = (expenses) => {
    const groups = {};
    expenses.forEach(exp => {
      const d = new Date(exp.created_at);
      const key = d.toISOString().split('T')[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(exp);
    });
    return Object.entries(groups).map(([date, data]) => ({ title: date, data }));
  };

>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  const sections = groupExpensesByDate(expenses);

  if (isLoading) {
    return (
<<<<<<< HEAD
      <MainScreenWrapper navigation={navigation} currentRoute="Expense">
=======
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={styles.loadingText}>Loading your expenses...</Text>
        </View>
        <Toast />
<<<<<<< HEAD
      </MainScreenWrapper>
=======
      </SafeAreaView>
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    );
  }

  return (
<<<<<<< HEAD
    <MainScreenWrapper navigation={navigation} currentRoute="Expense">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
=======
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
        style={{ flex: 1 }}
        keyboardVerticalOffset={64}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
<<<<<<< HEAD
          <View
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 55,
            }}
          >
            {/* Header with dynamic greeting and logout */}
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingLarge}>{`${getGreeting()}, ${
                  userName.split(" ")[0]
                }`}</Text>
                <Text style={styles.quote}>{quote}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
=======
          <View style={{ flex: 1 }}>
            {/* Header with dynamic greeting and logout */}
            <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingLarge}>{`${getGreeting()}, ${userName.split(' ')[0]}`}</Text>
                <Text style={styles.quote}>{quote}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
              >
                <Icon name="cog" size={20} color="#888888" />
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.balanceLabel}>Total Income</Text>
                <Text style={styles.balanceValue}>
<<<<<<< HEAD
                  {`₹${income.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
=======
                  {`₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                </Text>
              </Card.Content>
            </Card>

            {/* Payment List */}
<<<<<<< HEAD
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
                <Text style={styles.sectionTitle}>Expense History</Text>
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
                        color: "#222",
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
                                  color: "#222",
                                  fontSize: 16,
                                  marginBottom: 4,
                                }}
                              >
                                {item.description || "No description"}
                              </Text>
                              <Text style={{ color: "#888", fontSize: 14 }}>
                                {categoryNameLookup(item.category_id)}
                              </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                              <Text
                                style={{
                                  color: "#A259FF",
                                  fontWeight: "bold",
                                  fontSize: 18,
                                  marginBottom: 4,
                                }}
                              >
                                {`₹${item.amount}`}
                              </Text>
                              <Text style={{ color: "#bbb", fontSize: 12 }}>
                                {formatTime(item.created_at)}
                              </Text>
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 120 }}
                  stickySectionHeadersEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyMessage}>
                    Expense? Let's MoneyMate 💸
                  </Text>
                </View>
              )}
            </View>
            {/* Add/Edit Expense Form */}
            {showForm && (
              <Card style={styles.formCard}>
                <Card.Content>
                  <Text style={styles.formTitle}>
                    {editingExpenseId ? "Edit Expense" : "Add Expense"}
                  </Text>
                  {/* Category Selection */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Category</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {getAllCategoriesForSelection().map((cat) => (
=======
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Expense History</Text>
              {/* <TouchableOpacity activeOpacity={0.7} onPress={() => Toast.show({ type: 'info', text1: 'Coming soon!' })}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity> */}
            </View>
            {expenses.length > 0 ? (
              <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                renderSectionHeader={({ section: { title } }) => (
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 16, marginBottom: 4, color: '#222' }}>{formatSectionDate(title)}</Text>
                )}
                renderItem={({ item }) => (
                  <Card style={{ marginBottom: 12, marginHorizontal: 4, borderRadius: 12 }}>
                    <Card.Content>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: '#222', fontSize: 16, marginBottom: 4 }}>
                          {item.description || 'No description'}
                        </Text>
                        <Text style={{ color: '#888', fontSize: 14 }}>
                          {categoryNameLookup(item.category_id)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#A259FF', fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>
                          {`₹${item.amount}`}
                        </Text>
                        <Text style={{ color: '#bbb', fontSize: 12 }}>
                          {formatTime(item.created_at)}
                        </Text>
                      </View>
                    </View>
                    </Card.Content>
                  </Card>
                )}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                stickySectionHeadersEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyMessage}>Expense? Let's MoneyMate 💸</Text>
              </View>
            )}

            {/* Add Expense Form Card - Similar to Budget Categories */}
            {showForm ? (
              <Card style={styles.formCard}>
                <Card.Content>
                  <Text style={styles.formTitle}>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</Text>
                  
                  {/* Category Selection */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Category</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                      {categories.map((cat) => (
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryChip,
<<<<<<< HEAD
                            selectedCategory === cat.id &&
                              styles.selectedCategoryChip,
                          ]}
                          onPress={() => setSelectedCategory(cat.id)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              selectedCategory === cat.id &&
                                styles.selectedCategoryChipText,
                            ]}
                          >
                            {cat.displayName || cat.name}
=======
                            selectedCategory === cat.id && styles.selectedCategoryChip
                          ]}
                          onPress={() => setSelectedCategory(cat.id)}
                        >
                          <Text style={[
                            styles.categoryChipText,
                            selectedCategory === cat.id && styles.selectedCategoryChipText
                          ]}>
                            {cat.name}
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
<<<<<<< HEAD
                  {/* Amount Input */}
                  <TextInput
                    label="Amount"
                    value={formData.amount}
                    onChangeText={(text) =>
                      setFormData({ ...formData, amount: text })
                    }
=======

                  {/* Amount Input */}
                  <TextInput
                    label="Amount"
                    value={amount}
                    onChangeText={(text) => setAmount(text)}
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
<<<<<<< HEAD
                    left={
                      <TextInput.Icon icon="currency-inr" color="#A259FF" />
                    }
                  />
                  {/* Description Input */}
                  <TextInput
                    label="Description (optional)"
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData({ ...formData, description: text })
                    }
=======
                    left={<TextInput.Icon icon="currency-inr" color="#A259FF" />}
                  />

                  {/* Description Input */}
                  <TextInput
                    label="Description (optional)"
                    value={description}
                    onChangeText={(text) => setDescription(text)}
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
<<<<<<< HEAD
                    left={
                      <TextInput.Icon icon="note-outline" color="#A259FF" />
                    }
                  />
                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", marginTop: 16 }}>
                    <Button
                      mode="contained"
                      onPress={handleAddOrEditExpense}
                      style={styles.saveButton}
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
=======
                    left={<TextInput.Icon icon="note-outline" color="#A259FF" />}
                  />

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', marginTop: 16 }}>
                    <Button
                      mode="contained"
                      onPress={handleAddOrEditExpense}
                      style={styles.addButton}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      loading={loading}
                    >
                      {loading ? (editingExpenseId ? "Updating..." : "Adding...") : (editingExpenseId ? "Update Expense" : "Add Expense")}
                    </Button>
                    <View style={{ width: 12 }} />
                                  <Button
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                      mode="outlined"
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowForm(false);
<<<<<<< HEAD
                        setFormData({ amount: "", description: "" });
=======
                        setAmount("");
                        setDescription("");
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
                        setSelectedCategory(categories[0]?.id || "");
                        setEditingExpenseId(null);
                      }}
                      labelStyle={{ color: "#888888", fontWeight: "bold" }}
                    >
                      Cancel
                    </Button>
                  </View>
                </Card.Content>
              </Card>
<<<<<<< HEAD
            )}

            {/* Add Expense FAB */}
            {!showForm && (
              <FAB
                style={styles.fabFooter}
                icon="plus"
                onPress={() => setShowForm(true)}
                color="#fff"
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <Toast />
      </KeyboardAvoidingView>
    </MainScreenWrapper>
    // ...existing code ends cleanly at the MainScreenWrapper closing tag...
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
    backgroundColor: "#FFFFFF",
    borderColor: "#A259FF",
    color: "#222222",
    borderWidth: 1,
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
=======
            ) : (
              <>
                {/* Add Expense FAB */}
            <FAB
              style={styles.fabFooter}
              icon="plus"
              onPress={() => setShowForm(true)}
              color="#fff"
            />
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {/* Footer Navigation Bar */}
      <View style={styles.footerNav}>
        <TouchableOpacity style={styles.footerNavItem}>
          <Icon name="credit-card-outline" size={26} color="#A259FF" />
          <Text style={styles.footerNavLabelActive}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerNavItem} onPress={() => navigation.navigate('BudgetDetails')}>
          <Icon name="chart-pie" size={26} color="#888888" />
          <Text style={styles.footerNavLabel}>Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerNavItem}>
          <Icon name="chart-bar" size={26} color="#888888" />
          <Text style={styles.footerNavLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#222222', marginBottom: 4, textAlign: 'center', fontStyle: 'italic', textShadowColor: '#A259FF33', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  greeting: { fontSize: 18, color: '#222222', fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  greetingLarge: { fontSize: 26, color: '#222222', fontWeight: 'bold', textAlign: 'left', marginBottom: 8 },
  summaryCard: { marginBottom: 16, backgroundColor: '#F7F7F7', borderRadius: 12, elevation: 2, borderColor: '#E0E0E0', borderWidth: 1 },
  balanceLabel: { color: '#000', fontSize: 16, marginBottom: 4, fontWeight:600},
  balanceValue: { color: '#A259FF', fontSize: 32, fontWeight: 'bold', marginBottom:10 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, marginTop: -32, marginBottom: 16, borderColor: '#E0E0E0', borderWidth: 1 },
  actionItem: { alignItems: 'center', flex: 1 },
  actionLabel: { color: '#A259FF', marginTop: 4, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222222' },
  viewAll: { color: '#A259FF', fontWeight: 'bold' },
  categoryCard: { width: cardWidth, alignItems: 'center', padding: 16, backgroundColor: '#F7F7F7', borderRadius: 16, margin: 4, borderColor: '#E0E0E0', borderWidth: 1 },
  categoryLabel: { marginTop: 8, color: '#222222', fontWeight: '500' },
  fab: { position: 'absolute', bottom: 88, alignSelf: 'center', backgroundColor: '#A259FF', elevation: 4 },
  modalContainer: { backgroundColor: '#FFFFFF', width: '90%', alignSelf: 'center', borderRadius: 20, padding: 0, minHeight: 350, elevation: 5 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 6, borderWidth: 1, borderColor: '#A259FF' },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#222222", textAlign: "center", marginBottom: 4 },
  divider: { backgroundColor: '#A259FF', height: 2, marginVertical: 8, borderRadius: 2 },
  label: { fontSize: 15, marginBottom: 6, marginTop: 12, color: '#222222', fontWeight: 'bold' },
  input: { marginBottom: 16, backgroundColor: "#F7F7F7", borderRadius: 8, color: '#222222', borderColor: '#A259FF', borderWidth: 1 },
  chipRow: { paddingVertical: 4, paddingBottom: 8 },
  chip: { marginRight: 8, backgroundColor: '#F7F7F7', borderColor: '#A259FF', borderWidth: 1, height: 36 },
  selectedChip: { marginRight: 8, backgroundColor: '#A259FF', height: 36 },
  addButton: { marginTop: 12, borderRadius: 10, backgroundColor: '#A259FF', width: '100%', alignSelf: 'center' },
  cancelButton: { marginTop: 4, borderRadius: 10, width: '100%', alignSelf: 'center', borderColor: '#EB5757', borderWidth: 1 },
  quote: { fontStyle: 'italic', fontSize: 16, color: '#888888', marginBottom:10 },
  pickerWrapper: { backgroundColor: '#000', borderRadius: 8, borderColor: '#00ff99', borderWidth: 1, marginBottom: 16, marginTop: 4 },
  picker: { color: '#fff', height: 48, width: '100%' },
  formButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  formCard: { marginBottom: 16, backgroundColor: '#F7F7F7', borderRadius: 10, borderColor: '#A259FF', borderWidth: 1 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#A259FF', textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 15, marginBottom: 6, color: '#222222', fontWeight: 'bold' },
  input: { marginBottom: 12, backgroundColor: '#FFFFFF', borderColor: '#A259FF', color: '#222222', borderWidth: 1, borderRadius: 8 },
  categoryChip: { marginRight: 8, marginBottom: 8, backgroundColor: '#F7F7F7', borderColor: '#A259FF', borderWidth: 1, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16 },
  selectedCategoryChip: { backgroundColor: '#A259FF' },
  categoryChipText: { color: '#222222', fontWeight: 'bold' },
  selectedCategoryChipText: { color: '#FFFFFF', fontWeight: 'bold' },
  addButton: { flex: 1, backgroundColor: '#A259FF', borderRadius: 10 },
  cancelButton: { flex: 1, borderColor: '#888888', borderRadius: 10 },
  fabFooter: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#A259FF',
    elevation: 4,
    zIndex: 10,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
    minHeight: 200,
  },
  emptyMessage: {
    fontSize: 16,
<<<<<<< HEAD
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
=======
    color: '#888888',
    marginBottom:30,
    textAlign: 'center',
    fontWeight: '600',
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
  logoutButton: {
    padding: 8,
    borderRadius: 8,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
=======
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
<<<<<<< HEAD
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
=======
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

});
>>>>>>> 3c4a371cd1c31a7fb48873943c1c293ece7a28db
