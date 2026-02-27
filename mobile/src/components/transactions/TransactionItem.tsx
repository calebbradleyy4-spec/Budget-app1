import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TransactionDTO } from '../../types/shared';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

interface Props {
  transaction: TransactionDTO;
  onPress?: () => void;
}

export default function TransactionItem({ transaction, onPress }: Props) {
  const isIncome = transaction.type === 'income';
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: transaction.category?.color + '20' }]}>
        <Text style={styles.icon}>{transaction.category?.icon || '💳'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || transaction.category?.name || 'Transaction'}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  description: { fontSize: 15, fontWeight: '500', color: '#111827' },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700' },
  income: { color: '#22c55e' },
  expense: { color: '#ef4444' },
});
