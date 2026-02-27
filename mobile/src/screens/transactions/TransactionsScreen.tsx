import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, Modal, ScrollView,
} from 'react-native';
import { useTransactionsStore } from '../../store/transactions.store';
import { useCategoriesStore } from '../../store/categories.store';
import TransactionItem from '../../components/transactions/TransactionItem';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toYYYYMMDD } from '../../utils/date';
import type { CategoryDTO } from '../../types/shared';

export default function TransactionsScreen() {
  const { transactions, total, totalPages, page, fetchTransactions, createTransaction, deleteTransaction } =
    useTransactionsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: toYYYYMMDD(),
    category_id: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTransactions({ limit: 20 });
    fetchCategories();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchTransactions({ limit: 20 });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!form.amount || !form.category_id) {
      Alert.alert('Error', 'Please fill in amount and category');
      return;
    }
    setSaving(true);
    try {
      await createTransaction({
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date,
        category_id: form.category_id,
      });
      setShowAddModal(false);
      setForm({ type: 'expense', amount: '', description: '', date: toYYYYMMDD(), category_id: 0 });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create transaction');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: number) {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteTransaction(id),
      },
    ]);
  }

  const filteredCategories = categories.filter((c) => c.type === form.type);

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() =>
              Alert.alert(
                item.description || 'Transaction',
                `Amount: $${item.amount}\nDate: ${item.date}`,
                [
                  { text: 'Close', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
                ]
              )
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState title="No transactions yet" subtitle="Tap + to add your first transaction" icon="💳" />
        }
        ListFooterComponent={
          page < totalPages ? (
            <Button
              title="Load More"
              variant="outline"
              onPress={() => fetchTransactions({ page: page + 1, limit: 20 })}
              style={{ margin: 16 }}
            />
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Add Transaction</Text>

          <View style={styles.typeToggle}>
            {(['expense', 'income'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                onPress={() => setForm({ ...form, type: t, category_id: 0 })}
              >
                <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Amount"
            value={form.amount}
            onChangeText={(v) => setForm({ ...form, amount: v })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <Input
            label="Description"
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            placeholder="Optional"
          />
          <Input
            label="Date (YYYY-MM-DD)"
            value={form.date}
            onChangeText={(v) => setForm({ ...form, date: v })}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, form.category_id === cat.id && { backgroundColor: cat.color }]}
                onPress={() => setForm({ ...form, category_id: cat.id })}
              >
                <Text style={[styles.catChipText, form.category_id === cat.id && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button title="Save Transaction" onPress={handleAdd} loading={saving} style={styles.saveBtn} />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowAddModal(false)}
            style={styles.cancelBtn}
          />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, flexGrow: 1 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modal: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  typeToggle: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 4 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#6366f1' },
  typeBtnText: { color: '#6b7280', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  categoryScroll: { marginBottom: 16 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, backgroundColor: '#fff',
  },
  catChipText: { color: '#374151', fontSize: 13 },
  catChipTextActive: { color: '#fff' },
  saveBtn: { marginTop: 8 },
  cancelBtn: { marginTop: 8, marginBottom: 40 },
});
