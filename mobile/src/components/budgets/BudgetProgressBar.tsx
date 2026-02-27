import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BudgetWithSpentDTO } from '../../types/shared';
import { formatCurrency } from '../../utils/currency';

interface Props {
  budget: BudgetWithSpentDTO;
}

export default function BudgetProgressBar({ budget }: Props) {
  const pct = Math.min(budget.percentUsed, 100);
  const isOver = budget.percentUsed > 100;
  const barColor = isOver ? '#ef4444' : budget.percentUsed > 80 ? '#f59e0b' : '#22c55e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <View style={[styles.dot, { backgroundColor: budget.category.color }]} />
          <Text style={styles.categoryName}>{budget.category.name}</Text>
        </View>
        <Text style={[styles.pct, isOver && styles.overBudget]}>{budget.percentUsed}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.spent}>{formatCurrency(budget.spent)} spent</Text>
        <Text style={styles.limit}>of {formatCurrency(budget.amount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  categoryName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  pct: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  overBudget: { color: '#ef4444' },
  track: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  spent: { fontSize: 12, color: '#6b7280' },
  limit: { fontSize: 12, color: '#9ca3af' },
});
