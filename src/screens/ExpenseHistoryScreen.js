import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Title, Paragraph, ActivityIndicator, Appbar, IconButton, Dialog, Portal as PaperPortal, Button as PaperButton, TextInput as PaperTextInput, Chip } from 'react-native-paper';
import { supabase } from '../lib/supabase';

export default function ExpenseHistoryScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const user = await supabase.auth.getUser();
    // Fetch income
    const { data: incomeData } = await supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    setIncome(incomeData && incomeData.length > 0 ? incomeData[0].amount : 0);
    const { data: expData, error: expError } = await supabase
      .from('expenses')
      .select('id, category_id, amount, description, created_at')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
    const { data: catData } = await supabase
      .from('budget_categories')
      .select('id, name, amount');
    const catMap = {};
    (catData || []).forEach(cat => { catMap[cat.id] = { name: cat.name, budget: cat.amount }; });
    setCategories(catMap);
    setExpenses(expData || []);
    setLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    setLoading(true);
    await supabase.from('expenses').delete().eq('id', id);
    await fetchExpenses();
    setLoading(false);
  };

  const openEditDialog = (expense) => {
    setEditExpense(expense);
    setEditAmount(String(expense.amount));
    setEditDescription(expense.description || '');
    setEditCategory(expense.category_id);
    setEditDialogVisible(true);
  };

  const handleEditExpense = async () => {
    setEditLoading(true);
    await supabase.from('expenses').update({
      amount: Number(editAmount),
      description: editDescription,
      category_id: editCategory
    }).eq('id', editExpense.id);
    setEditDialogVisible(false);
    setEditLoading(false);
    setEditExpense(null);
    await fetchExpenses();
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Calculate overspent categories
  const categorySpend = {};
  expenses.forEach(e => {
    if (!categorySpend[e.category_id]) categorySpend[e.category_id] = 0;
    categorySpend[e.category_id] += Number(e.amount);
  });
  const overspends = Object.entries(categorySpend)
    .filter(([catId, spent]) => categories[catId] && spent > Number(categories[catId].budget))
    .map(([catId, spent]) => ({
      name: categories[catId].name,
      overspent: spent - Number(categories[catId].budget)
    }));

  const renderExpense = ({ item }) => (
    <Card style={styles.expenseCard}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title style={styles.expenseAmount}>₹{item.amount}</Title>
          <Text style={styles.expenseCategory}>{categories[item.category_id]?.name || 'Category'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton icon="pencil" color="#00ff99" size={22} onPress={() => openEditDialog(item)} />
            <IconButton icon="delete" color="#e53935" size={22} onPress={() => handleDeleteExpense(item.id)} />
          </View>
        </View>
        {item.description ? <Paragraph style={styles.expenseDesc}>{item.description}</Paragraph> : null}
        <Text style={styles.expenseDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Expense History" titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
      </Appbar.Header>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>Total Income: <Text style={{ color: income - totalExpenses < 0 ? '#e53935' : '#00ff99', fontWeight: 'bold' }}>₹{income}</Text></Text>
          <Text style={styles.summaryText}>Total Expenses: <Text style={{ color: '#e53935', fontWeight: 'bold' }}>₹{totalExpenses}</Text></Text>
          <Text style={styles.summaryText}>Income Left: <Text style={{ color: income - totalExpenses < 0 ? '#e53935' : '#00ff99', fontWeight: 'bold' }}>₹{income - totalExpenses}</Text></Text>
          {overspends.length > 0 && <Text style={[styles.summaryText, { marginTop: 8, fontWeight: 'bold', color: '#fff' }]}>Overspent Categories:</Text>}
          {overspends.map((o, idx) => (
            <Text key={o.name} style={{ color: '#e53935', marginLeft: 8 }}>
              {o.name}: Overspent by ₹{o.overspent}
            </Text>
          ))}
        </Card.Content>
      </Card>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={renderExpense}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses logged yet.</Text>}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
      />
      <PaperPortal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)} style={styles.dialog}>
          <Text style={styles.dialogTitle}>Edit Expense</Text>
          <Dialog.Content>
            <Text style={styles.label}>Category</Text>
            <FlatList
              data={Object.entries(categories)}
              horizontal
              keyExtractor={([id]) => id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item: [id, cat] }) => (
                <Chip
                  mode={editCategory === id ? 'flat' : 'outlined'}
                  style={editCategory === id ? styles.selectedChip : styles.chip}
                  textStyle={{ color: editCategory === id ? '#000' : '#00ff99', fontWeight: 'bold' }}
                  onPress={() => setEditCategory(id)}
                >
                  {cat.name}
                </Chip>
              )}
            />
            <Text style={styles.label}>Amount</Text>
            <PaperTextInput
              mode="outlined"
              style={styles.input}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              outlineColor="#00ff99"
              activeOutlineColor="#00ff99"
              left={<PaperTextInput.Icon name="currency-inr" color="#00ff99" />}
              textColor="#fff"
            />
            <Text style={styles.label}>Description</Text>
            <PaperTextInput
              mode="outlined"
              style={styles.input}
              value={editDescription}
              onChangeText={setEditDescription}
              outlineColor="#00ff99"
              activeOutlineColor="#00ff99"
              left={<PaperTextInput.Icon name="note-outline" color="#00ff99" />}
              textColor="#fff"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <PaperButton onPress={() => setEditDialogVisible(false)} mode="outlined" style={styles.cancelButton} labelStyle={{ color: '#e53935', fontWeight: 'bold' }}>Cancel</PaperButton>
              <PaperButton onPress={handleEditExpense} loading={editLoading} mode="contained" style={styles.addButton} labelStyle={{ color: '#000', fontWeight: 'bold' }}>Save</PaperButton>
            </View>
          </Dialog.Content>
        </Dialog>
      </PaperPortal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 0 },
  appbar: { backgroundColor: '#111', elevation: 4, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  summaryCard: { margin: 16, marginBottom: 0, borderRadius: 20, backgroundColor: '#111', elevation: 0, borderWidth: 1, borderColor: '#00ff99' },
  summaryTitle: { fontWeight: 'bold', color: '#00ff99', fontSize: 18, marginBottom: 4 },
  summaryText: { color: '#fff', fontSize: 15 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#00ff99', textAlign: 'center', marginTop: 16 },
  expenseCard: { marginBottom: 12, borderRadius: 20, backgroundColor: '#111', marginHorizontal: 16, borderWidth: 1, borderColor: '#222' },
  expenseAmount: { color: '#e53935', fontWeight: 'bold', fontSize: 20 },
  expenseCategory: { color: '#00ff99', fontWeight: 'bold', fontSize: 16 },
  expenseDesc: { color: '#b0b8c1', fontStyle: 'italic', marginTop: 4 },
  expenseDate: { color: '#888', fontSize: 12, marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#b0b8c1', marginTop: 40, fontSize: 16 },
  dialog: { backgroundColor: '#111', borderRadius: 20 },
  dialogTitle: { color: '#00ff99', fontWeight: 'bold', fontSize: 20, textAlign: 'center', marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: '#000', marginBottom: 12, color: '#fff', borderColor: '#00ff99', borderWidth: 1 },
  chip: { marginRight: 8, backgroundColor: '#111', borderColor: '#00ff99', borderWidth: 1 },
  selectedChip: { marginRight: 8, backgroundColor: '#00ff99' },
  chipLabel: { color: '#00ff99', fontWeight: 'bold' },
  selectedChipLabel: { color: '#000', fontWeight: 'bold' },
  label: { color: '#fff', marginBottom: 8 },
  chipRow: { paddingHorizontal: 16, paddingBottom: 12 },
  cancelButton: { borderColor: '#e53935', borderWidth: 1 },
  addButton: { backgroundColor: '#00ff99' },
}); 