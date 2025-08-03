import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, ActivityIndicator, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

export default function BudgetDetailsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', amount: '' });
  const [loading, setLoading] = useState(false);

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
        fetchExpenses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserName = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.data.user.id)
      .single();
    if (!error && data?.name) {
      setUserName(data.name.split(' ')[0]);
    } else {
      setUserName('User');
    }
  };

  const fetchCategories = async () => {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
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
      .limit(1)
      .single();
    if (!error && data?.amount) {
      setIncome(data.amount);
    } else {
      setIncome(0);
    }
  };

  const fetchExpenses = async () => {
    const user = await supabase.auth.getUser();
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.data.user.id);
    setExpenses(data || []);
  };

  const calculateCategorySpending = (categoryId) => {
    return expenses
      .filter(expense => expense.category_id === categoryId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalAllocated = () => {
    return categories.reduce((total, cat) => total + Number(cat.amount), 0);
  };

  const getTotalSpent = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', amount: '' });
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
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
      return;
    }

    const newAmount = Number(formData.amount);
    const currentTotal = getTotalAllocated();
    const editingAmount = editingCategory ? Number(editingCategory.amount) : 0;
    
    if (currentTotal - editingAmount + newAmount > income) {
      Alert.alert('Error', 'Total allocation would exceed your income!');
      return;
    }

    setLoading(true);
    const user = await supabase.auth.getUser();

    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from('budget_categories')
        .update({ name: formData.name, amount: newAmount })
        .eq('id', editingCategory.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to update category. Try again.');
        setLoading(false);
        return;
      }
    } else {
      // Add new category
      const { error } = await supabase
        .from('budget_categories')
        .insert([{ 
          user_id: user.data.user.id, 
          name: formData.name, 
          amount: newAmount 
        }]);
      
      if (error) {
        Alert.alert('Error', 'Failed to add category. Try again.');
        setLoading(false);
        return;
      }
    }
    
    setLoading(false);
    setShowForm(false);
    setFormData({ name: '', amount: '' });
    setEditingCategory(null);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={styles.loadingText}>Loading your budget details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    
    
      <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={64}
    >
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
                <Text style={styles.summaryValue}>₹{income.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Allocated</Text>
                <Text style={styles.summaryValue}>₹{getTotalAllocated().toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={styles.summaryValue}>₹{getTotalSpent().toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddCategory}
            >
              <Icon name="plus" size={20} color="#A259FF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const spent = calculateCategorySpending(item.id);
              const remaining = Number(item.amount) - spent;
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
          />
        </View>

        {/* Add/Edit Category Form */}
        {showForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>{editingCategory ? 'Edit Category' : 'Add Category'}</Text>
              
              <TextInput
                label="Category Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
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
              />

              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <Button
                  mode="contained"
                  onPress={handleAddOrEditCategory}
                  style={styles.saveButton}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  loading={loading}
                >
                  {loading ? (editingCategory ? "Updating..." : "Adding...") : (editingCategory ? "Update Category" : "Add Category")}
                </Button>
                <View style={{ width: 12 }} />
                <Button
                  mode="outlined"
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
                    setFormData({ name: '', amount: '' });
                    setEditingCategory(null);
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
                    deleteAction === 'delete' && styles.selectedDeleteOption
                  ]}
                  onPress={() => setDeleteAction('delete')}
                >
                  <Text style={[
                    styles.deleteOptionText,
                    deleteAction === 'delete' && styles.selectedDeleteOptionText
                  ]}>
                    Delete all expenses
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteOption,
                    deleteAction === 'move' && styles.selectedDeleteOption
                  ]}
                  onPress={() => setDeleteAction('move')}
                >
                  <Text style={[
                    styles.deleteOptionText,
                    deleteAction === 'move' && styles.selectedDeleteOptionText
                  ]}>
                    Move expenses to another category
                  </Text>
                </TouchableOpacity>
              </View>



              {deleteAction === 'move' && (
                <View style={styles.targetCategorySection}>
                  <Text style={styles.targetCategoryLabel}>Select target category:</Text>
                  <View style={styles.targetCategoryList}>
                    {categories
                      .filter(cat => cat.id !== categoryToDelete?.id)
                      .map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.targetCategoryOption,
                            targetCategory === cat.id && styles.selectedTargetCategory
                          ]}
                          onPress={() => setTargetCategory(cat.id)}
                        >
                          <Text style={[
                            styles.targetCategoryOptionText,
                            targetCategory === cat.id && styles.selectedTargetCategoryText
                          ]}>
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
                    setDeleteAction('');
                    setTargetCategory('');
                  }}
                >
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmDeleteButton,
                    !deleteAction && styles.disabledDeleteButton
                  ]}
                  onPress={confirmDeleteCategory}
                  disabled={!deleteAction}
                >
                  <Text style={[
                    styles.confirmDeleteText,
                    !deleteAction && styles.disabledDeleteText
                  ]}>
                    {deleteAction === 'move' ? 'Move & Delete' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  summaryCard: {
    marginBottom: 20,
    marginHorizontal: 4,
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
  categoriesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#A259FF',
  },
  categoryCard: {
    marginBottom: 12,
    marginHorizontal: 4,
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
    flex: 1,
  },
  spendingLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  spendingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
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
  saveButton: {
    flex: 1,
    backgroundColor: '#A259FF',
    borderRadius: 10,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#888888',
    borderRadius: 10,
  },
  deleteModalOverlay: {
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
    marginBottom: 8,
  },
  deleteModalSubtitle: {
    fontSize: 16,
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteModalWarning: {
    fontSize: 14,
    color: '#EB5757',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  deleteOptions: {
    marginBottom: 20,
  },
  deleteOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
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
  },
  targetCategorySection: {
    marginBottom: 20,
  },
  targetCategoryLabel: {
    fontSize: 14,
    color: '#222222',
    marginBottom: 8,
    fontWeight: '600',
  },
  targetCategoryList: {
    maxHeight: 120,
  },
  targetCategoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
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
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
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