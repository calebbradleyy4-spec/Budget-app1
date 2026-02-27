import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { useTransactionsStore } from '../../store/transactions.store';
import { useBudgetsStore } from '../../store/budgets.store';
import { getMonthlySummary } from '../../api/reports';
import Card from '../../components/common/Card';
import TransactionItem from '../../components/transactions/TransactionItem';
import BudgetProgressBar from '../../components/budgets/BudgetProgressBar';
import { formatCurrency } from '../../utils/currency';
import { toYYYYMM } from '../../utils/date';
import type { MonthlySummaryDTO } from '../../types/shared';
import type { AppTabNavProp } from '../../navigation/types';

export default function DashboardScreen() {
  const navigation = useNavigation<AppTabNavProp>();
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionsStore();
  const { budgets, fetchBudgets } = useBudgetsStore();
  const [summary, setSummary] = useState<MonthlySummaryDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = toYYYYMM();

  async function loadData() {
    await Promise.all([
      fetchTransactions({ limit: 5 }),
      fetchBudgets(currentMonth),
      getMonthlySummary(currentMonth).then(setSummary).catch(() => null),
    ]);
  }

  useEffect(() => { loadData(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.month}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
      </View>

      {/* Summary Card */}
      {summary && (
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, styles.income]}>{formatCurrency(summary.totalIncome)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, styles.expense]}>{formatCurrency(summary.totalExpense)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, summary.balance >= 0 ? styles.income : styles.expense]}>
                {formatCurrency(Math.abs(summary.balance))}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {budgets.slice(0, 3).map((budget) => (
            <BudgetProgressBar key={budget.id} budget={budget} />
          ))}
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : (
          transactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))
        )}
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  greeting: { marginBottom: 16 },
  greetingText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  month: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  summaryCard: { backgroundColor: '#6366f1' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  income: { color: '#22c55e' },
  expense: { color: '#ef4444' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { color: '#6366f1', fontSize: 14, fontWeight: '600' },
  empty: { color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
});
