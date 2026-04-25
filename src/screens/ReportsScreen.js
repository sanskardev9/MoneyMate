import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, ProgressBar } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MainScreenWrapper from '../components/MainScreenWrapper';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categorySpending, setCategorySpending] = useState({});

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (expensesError) throw expensesError;

      // Load main categories (no parent)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .is('parent_id', null);
      if (categoriesError) throw categoriesError;

      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
      calculateAnalytics(expensesData || [], categoriesData || []);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (expensesData, categoriesData) => {
    const total = expensesData.reduce((sum, e) => sum + Number(e.amount), 0);
    setTotalSpent(total);

    const map = {};
    categoriesData.forEach(c => {
      const spent = expensesData
        .filter(e => e.category_id === c.id)
        .reduce((s, e) => s + Number(e.amount), 0);
      const budget = Number(c.amount) || 0;
      map[c.id] = {
        name: c.name,
        amount: spent,
        budgetAllocated: budget,
        budgetPercentage: budget ? (spent / budget) * 100 : 0,
      };
    });
    setCategorySpending(map);

    // Calculate monthly spending (last 6 months)
    const monthly = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.toISOString().split('T')[0];
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
      const monthTotal = expensesData
        .filter(e => e.created_at >= start && e.created_at <= end)
        .reduce((s, e) => s + Number(e.amount), 0);
      monthly.push({
        month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        amount: monthTotal,
      });
    }
    setMonthlyData(monthly);
  };

  // Helpers for the 4 top cards
  const getTodaySpent = () =>
    expenses
      .filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
      .reduce((s, e) => s + Number(e.amount), 0);

  const getWeekSpent = () => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return expenses
      .filter(e => new Date(e.created_at) >= start)
      .reduce((s, e) => s + Number(e.amount), 0);
  };

  const getMonthSpent = () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return expenses
      .filter(e => new Date(e.created_at) >= start)
      .reduce((s, e) => s + Number(e.amount), 0);
  };

  const getTopCategorySpent = () => {
    const map = {};
    expenses.forEach(e => {
      map[e.category_id] = (map[e.category_id] || 0) + e.amount;
    });
    return Math.max(0, ...Object.values(map));
  };

  /* Render Summary Cards */
  const renderSummaryCards = () => (
    <View style={styles.summaryRow}>
      {[
        { label: 'Today', amount: getTodaySpent(), icon: 'calendar-today' },
        { label: 'Week', amount: getWeekSpent(), icon: 'calendar-week' },
        { label: 'Month', amount: getMonthSpent(), icon: 'calendar-month' },
        { label: 'Top Category', amount: getTopCategorySpent(), icon: 'format-list-numbered' },
      ].map((card, index) => (
        <Card key={card.label} style={styles.summaryCard}>
          <Card.Content style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={card.icon} size={24} color="#A259FF" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.summaryTitle}>{card.label}</Text>
              <Text style={styles.summaryAmount}>₹{card.amount.toLocaleString('en-IN')}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  /* Render Monthly Chart */
  const renderMonthlyChart = () => {
    const max = Math.max(...monthlyData.map(m => m.amount), 1);
    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Monthly Spending Trend</Title>
          <View style={styles.chartContainer}>
            {monthlyData.map((m, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: (m.amount / max) * 120 }]} />
                </View>
                <Text style={styles.barLabel}>{m.month}</Text>
                <Text style={styles.barAmount}>₹{m.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  /* Render Category Breakdown */
  const renderCategoryBreakdown = () => {
    const list = Object.values(categorySpending)
      .filter(c => c.budgetAllocated > 0)
      .sort((a, b) => b.budgetPercentage - a.budgetPercentage);

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Budget vs Spending</Title>
          {list.map(c => (
            <View key={c.name} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{c.name}</Text>
                <View style={styles.categoryAmounts}>
                  <Text style={styles.spentAmount}>₹{c.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.budgetAmount}>/ ₹{c.budgetAllocated.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <ProgressBar
                progress={Math.min(c.budgetPercentage / 100, 1)}
                color={c.budgetPercentage > 100 ? '#FF4444' : '#A259FF'}
                style={styles.progressBar}
              />
              <Text style={[styles.percentageText, { color: c.budgetPercentage > 100 ? '#FF4444' : '#888' }]}>
                {c.budgetPercentage > 100 ? 'Over Budget' : `${c.budgetPercentage.toFixed(1)}%`}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <MainScreenWrapper navigation={navigation} currentRoute="Reports">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </MainScreenWrapper>
    );
  }

  return (
    <MainScreenWrapper navigation={navigation} currentRoute="Reports">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Spending Reports</Text>
        <Text style={styles.headerSubtitle}>Analyze your spending patterns</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 4 top cards */}
        {renderSummaryCards()}
        {/* Monthly SpendingContinuing from where I left off:

```jsx
Chart */}
        {renderMonthlyChart()}
        {/* Budget vs Spending */}
        {renderCategoryBreakdown()}
      </ScrollView>
    </MainScreenWrapper>
  );
};

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#888888' },

  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  headerSubtitle: { fontSize: 14, color: '#666' },

  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: (width - 48) / 2,
    height: 120,
    marginBottom: 12,
    backgroundColor: '#F7F7F7', // Light grey background for all cards
    borderWidth: 0, // No border
    borderRadius: 12,
    elevation: 0, // No shadow
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  summaryAmount: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },

  chartCard: {
    marginBottom: 16,
    backgroundColor: '#F7F7F7', // Same light grey background as summary cards
    borderWidth: 0, // No border
    borderRadius: 12,
    elevation: 0, // No shadow
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barContainer: { flex: 1, alignItems: 'center' },
  barWrapper: { height: 120, justifyContent: 'flex-end', marginBottom: 4 },
  bar: { width: 20, backgroundColor: '#A259FF', borderRadius: 10 },
  barLabel: { fontSize: 10, color: '#666' },
  barAmount: { fontSize: 10, color: '#000', fontWeight: '600' },

  categoryItem: { marginBottom: 12 },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: { flex: 1, fontSize: 14, fontWeight: '600' },
  categoryAmounts: { flexDirection: 'row' },
  spentAmount: { fontSize: 14, fontWeight: 'bold', color: '#A259FF' },
  budgetAmount: { fontSize: 12, color: '#666', marginLeft: 4 },
  percentageText: { fontSize: 12, marginTop: 2 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: '#F0F0F0' },
});

export default ReportsScreen;