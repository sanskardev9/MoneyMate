import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, ActivityIndicator, TextInput, Button, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

export default function CategoryExpenseHistoryScreen({ navigation, route }) {
  const { categoryId, categoryName, allocatedAmount } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [expenseToMove, setExpenseToMove] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedTargetCategory, setSelectedTargetCategory] = useState('');

  useEffect(() => {
    fetchCategoryExpenses();
    fetchAvailableCategories();
  }, [categoryId]);

  const fetchAvailableCategories = async () => {
    const user = await supabase.auth.getUser();
    const { data } = await supabase
      .from('budget_categories')
      .select('id, name')
      .eq('user_id', user.data.user.id)
      .neq('id', categoryId); // Exclude current category
    setAvailableCategories(data || []);
  };

  const fetchCategoryExpenses = async () => {
    setIsLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });
      
      setExpenses(data || []);
      const total = (data || []).reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error fetching category expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRemainingAmount = () => {
    return allocatedAmount - totalSpent;
  };

  const getSpentPercentage = () => {
    return allocatedAmount > 0 ? (totalSpent / allocatedAmount) * 100 : 0;
  };

  const handleEditExpense = (expense) => {
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description || ''
    });
    setEditingExpenseId(expense.id);
    setShowForm(true);
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('expenses').delete().eq('id', expenseId);
        fetchCategoryExpenses();
      }},
    ]);
  };

  const handleMoveExpense = (expense) => {
    setExpenseToMove(expense);
    setSelectedTargetCategory('');
    setShowMoveModal(true);
  };

  const confirmMoveExpense = async () => {
    if (!selectedTargetCategory) {
      Alert.alert('Error', 'Please select a target category.');
      return;
    }

    const { error } = await supabase
      .from('expenses')
      .update({ category_id: selectedTargetCategory })
      .eq('id', expenseToMove.id);

    if (error) {
      Alert.alert('Error', 'Failed to move expense. Try again.');
      return;
    }

    setShowMoveModal(false);
    setExpenseToMove(null);
    setSelectedTargetCategory('');
    fetchCategoryExpenses();
  };

  const handleAddOrEditExpense = async () => {
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    setLoading(true);
    const user = await supabase.auth.getUser();
    
    if (editingExpenseId) {
      // Update existing expense
      const { error } = await supabase
        .from('expenses')
        .update({ 
          amount: Number(formData.amount), 
          description: formData.description 
        })
        .eq('id', editingExpenseId);
      
      if (error) {
        Alert.alert('Error', 'Failed to update expense. Try again.');
        setLoading(false);
        return;
      }
    } else {
      // Add new expense
      const { error } = await supabase
        .from('expenses')
        .insert([{ 
          user_id: user.data.user.id, 
          category_id: categoryId, 
          amount: Number(formData.amount), 
          description: formData.description 
        }]);
      
      if (error) {
        Alert.alert('Error', 'Failed to add expense. Try again.');
        setLoading(false);
        return;
      }
    }
    
    setLoading(false);
    setShowForm(false);
    setFormData({ amount: '', description: '' });
    setEditingExpenseId(null);
    fetchCategoryExpenses();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={styles.loadingText}>Loading {categoryName} expenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={64}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#A259FF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{categoryName}</Text>
          </View>

          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Category Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Allocated</Text>
                  <Text style={styles.summaryValue}>₹{allocatedAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Spent</Text>
                  <Text style={styles.summaryValue}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Remaining</Text>
                  <Text style={[styles.summaryValue, getRemainingAmount() < 0 && styles.overspent]}>
                    ₹{getRemainingAmount().toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(getSpentPercentage(), 100)}%` },
                      getSpentPercentage() > 100 && styles.progressOverspent
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(getSpentPercentage())}% used</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Expenses List */}
          <View style={styles.expensesContainer}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            {expenses.length > 0 ? (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={[styles.expenseCard, { marginHorizontal: 4 }]}>
                    <Card.Content>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: '#222', fontSize: 16, marginBottom: 4 }}>
                            {item.description || 'No description'}
                          </Text>
                          <Text style={{ color: '#888', fontSize: 14 }}>
                            {categoryName}
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
                      <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => handleEditExpense(item)} style={{ marginRight: 8 }}>
                          <Icon name="pencil" size={20} color="#A259FF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMoveExpense(item)} style={{ marginRight: 8 }}>
                          <MaterialCommunityIcons name="swap-horizontal" size={20} color="#FF9500" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteExpense(item.id)}>
                          <Icon name="delete" size={20} color="#EB5757" />
                        </TouchableOpacity>
                      </View>
                    </Card.Content>
                  </Card>
                )}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyMessage}>No expenses in {categoryName} yet 💸</Text>
              </View>
            )}
          </View>

          {/* Add/Edit Expense Form */}
          {showForm && (
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={styles.formTitle}>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</Text>
                
                <TextInput
                  label="Amount"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
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
                  left={<TextInput.Icon icon="currency-inr" color="#A259FF" />}
                />

                <TextInput
                  label="Description (optional)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                  left={<TextInput.Icon icon="note-outline" color="#A259FF" />}
                />

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
                    mode="outlined"
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowForm(false);
                      setFormData({ amount: '', description: '' });
                      setEditingExpenseId(null);
                    }}
                    labelStyle={{ color: "#888888", fontWeight: "bold" }}
                  >
                    Cancel
                  </Button>
                </View>
              </Card.Content>
            </Card>
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

          {/* Move Expense Modal */}
          {showMoveModal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Move Expense</Text>
                <Text style={styles.modalSubtitle}>
                  Move "{expenseToMove?.description || 'No description'}" to another category
                </Text>
                
                <View style={styles.categoryList}>
                  {availableCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        selectedTargetCategory === cat.id && styles.selectedCategoryOption
                      ]}
                      onPress={() => setSelectedTargetCategory(cat.id)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        selectedTargetCategory === cat.id && styles.selectedCategoryOptionText
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={() => {
                      setShowMoveModal(false);
                      setExpenseToMove(null);
                      setSelectedTargetCategory('');
                    }}
                  >
                    <Text style={styles.cancelModalText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmModalButton}
                    onPress={confirmMoveExpense}
                  >
                    <Text style={styles.confirmModalText}>Move</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888888',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    elevation: 2,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A259FF',
  },
  overspent: {
    color: '#EB5757',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
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
  expensesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  expenseCard: {
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    elevation: 2,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '600',
  },
  formCard: {
    marginBottom: 16,
    marginHorizontal: 4,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    borderColor: '#A259FF',
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
    backgroundColor: '#FFFFFF',
    borderColor: '#A259FF',
    color: '#222222',
    borderWidth: 1,
    borderRadius: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#A259FF',
    borderRadius: 10,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#888888',
    borderRadius: 10,
  },
  fabFooter: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#A259FF',
    elevation: 4,
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryList: {
    marginBottom: 20,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryOption: {
    backgroundColor: '#A259FF',
    borderColor: '#A259FF',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#222222',
    textAlign: 'center',
  },
  selectedCategoryOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#A259FF',
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelModalText: {
    color: '#888888',
    fontWeight: '600',
  },
  confirmModalText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 