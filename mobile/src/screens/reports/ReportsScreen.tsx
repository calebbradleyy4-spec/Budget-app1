import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { getSpendingByCategory, getMonthlyTrend, getMonthlySummary } from '../../api/reports';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/currency';
import { toYYYYMM, formatMonth, previousMonth, nextMonth } from '../../utils/date';
import type { CategorySpendDTO, MonthlyTrendDTO, MonthlySummaryDTO } from '../../types/shared';

export default function ReportsScreen() {
  const [month, setMonth] = useState(toYYYYMM());
  const [spending, setSpending] = useState<CategorySpendDTO[]>([]);
  const [trend, setTrend] = useState<MonthlyTrendDTO[]>([]);
  const [summary, setSummary] = useState<MonthlySummaryDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData(m: string) {
    await Promise.all([
      getSpendingByCategory(m).then(setSpending).catch(() => null),
      getMonthlyTrend(6).then(setTrend).catch(() => null),
      getMonthlySummary(m).then(setSummary).catch(() => null),
    ]);
  }

  useEffect(() => { loadData(month); }, [month]);

  function navigateMonth(dir: 'prev' | 'next') {
    setMonth((m) => dir === 'prev' ? previousMonth(m) : nextMonth(m));
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData(month);
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.content}
    >
      {/* Month Navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonth(month)}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navBtn} disabled={month >= toYYYYMM()}>
          <Text style={[styles.navArrow, month >= toYYYYMM() && styles.disabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {summary && (
        <Card>
          <Text style={styles.cardTitle}>Monthly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, styles.incomeColor]}>{formatCurrency(summary.totalIncome)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, styles.expenseColor]}>{formatCurrency(summary.totalExpense)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, summary.balance >= 0 ? styles.incomeColor : styles.expenseColor]}>
                {formatCurrency(Math.abs(summary.balance))}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Transactions</Text>
              <Text style={styles.summaryValue}>{summary.transactionCount}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Spending by Category */}
      {spending.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Spending by Category</Text>
          {spending.map((item) => (
            <View key={item.category_id} style={styles.spendRow}>
              <View style={[styles.catDot, { backgroundColor: item.category_color }]} />
              <Text style={styles.catName}>{item.category_name}</Text>
              <View style={styles.spendRight}>
                <Text style={styles.spendAmount}>{formatCurrency(item.total)}</Text>
                <Text style={styles.spendPct}>{item.percentage}%</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Monthly Trend */}
      {trend.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          {trend.map((item) => (
            <View key={item.month} style={styles.trendRow}>
              <Text style={styles.trendMonth}>{item.month}</Text>
              <View style={styles.trendBars}>
                <View style={styles.trendItem}>
                  <View style={[styles.trendBar, styles.incomeBar, { width: `${Math.min((item.income / Math.max(...trend.map(t => t.income), 1)) * 100, 100)}%` }]} />
                  <Text style={styles.trendValue}>{formatCurrency(item.income)}</Text>
                </View>
                <View style={styles.trendItem}>
                  <View style={[styles.trendBar, styles.expenseBar, { width: `${Math.min((item.expense / Math.max(...trend.map(t => t.expense), 1)) * 100, 100)}%` }]} />
                  <Text style={styles.trendValue}>{formatCurrency(item.expense)}</Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      {spending.length === 0 && (!summary || summary.transactionCount === 0) && (
        <Text style={styles.empty}>No data for this month</Text>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: '#6366f1' },
  disabled: { color: '#d1d5db' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryItem: { width: '50%', marginBottom: 12 },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  incomeColor: { color: '#22c55e' },
  expenseColor: { color: '#ef4444' },
  spendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  catDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  catName: { flex: 1, fontSize: 14, color: '#374151' },
  spendRight: { alignItems: 'flex-end' },
  spendAmount: { fontSize: 14, fontWeight: '600', color: '#111827' },
  spendPct: { fontSize: 11, color: '#9ca3af' },
  trendRow: { marginBottom: 12 },
  trendMonth: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  trendBars: { gap: 4 } as any,
  trendItem: { flexDirection: 'row', alignItems: 'center' },
  trendBar: { height: 8, borderRadius: 4, marginRight: 8 },
  incomeBar: { backgroundColor: '#22c55e' },
  expenseBar: { backgroundColor: '#ef4444' },
  trendValue: { fontSize: 12, color: '#374151' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 16 },
});
