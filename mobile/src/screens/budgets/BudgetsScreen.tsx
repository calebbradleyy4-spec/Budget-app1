import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Modal, Alert,
} from 'react-native';
import { useBudgetsStore } from '../../store/budgets.store';
import { useCategoriesStore } from '../../store/categories.store';
import BudgetProgressBar from '../../components/budgets/BudgetProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { toYYYYMM, formatMonth, previousMonth, nextMonth } from '../../utils/date';

export default function BudgetsScreen() {
  const { budgets, selectedMonth, setMonth, fetchBudgets, createBudget, deleteBudget } = useBudgetsStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ category_id: 0, amount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  }

  function navigateMonth(dir: 'prev' | 'next') {
    const m = dir === 'prev' ? previousMonth(selectedMonth) : nextMonth(selectedMonth);
    setMonth(m);
    fetchBudgets(m);
  }

  async function handleAdd() {
    if (!form.category_id || !form.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await createBudget({ category_id: form.category_id, month: selectedMonth, amount: parseFloat(form.amount) });
      setShowAddModal(false);
      setForm({ category_id: 0, amount: '' });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create budget');
    } finally {
      setSaving(false);
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const existingCatIds = new Set(budgets.map((b) => b.category_id));
  const availableCategories = expenseCategories.filter((c) => !existingCatIds.has(c.id));

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonth(selectedMonth)}</Text>
          <TouchableOpacity
            onPress={() => navigateMonth('next')}
            style={styles.navBtn}
            disabled={selectedMonth >= toYYYYMM()}
          >
            <Text style={[styles.navArrow, selectedMonth >= toYYYYMM() && styles.disabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <EmptyState title="No budgets set" subtitle="Tap + to set a budget for this month" icon="📊" />
        ) : (
          <Card>
            {budgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                onLongPress={() =>
                  Alert.alert('Delete Budget', `Remove budget for ${budget.category.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(budget.id) },
                  ])
                }
              >
                <BudgetProgressBar budget={budget} />
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Add Budget</Text>
          <Text style={styles.monthBadge}>{formatMonth(selectedMonth)}</Text>

          <Input
            label="Budget Amount"
            value={form.amount}
            onChangeText={(v) => setForm({ ...form, amount: v })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          {availableCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catRow, form.category_id === cat.id && styles.catRowActive]}
              onPress={() => setForm({ ...form, category_id: cat.id })}
            >
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
              {form.category_id === cat.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}

          {availableCategories.length === 0 && (
            <Text style={styles.noMore}>All expense categories already have budgets this month.</Text>
          )}

          <Button title="Save Budget" onPress={handleAdd} loading={saving} style={styles.saveBtn} disabled={availableCategories.length === 0} />
          <Button title="Cancel" variant="outline" onPress={() => setShowAddModal(false)} style={styles.cancelBtn} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, flexGrow: 1 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: '#6366f1', fontWeight: '300' },
  disabled: { color: '#d1d5db' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modal: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  monthBadge: { fontSize: 14, color: '#6366f1', fontWeight: '600', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1,
    borderColor: '#e5e7eb', backgroundColor: '#fff', marginBottom: 8,
  },
  catRowActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  catDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  catName: { flex: 1, fontSize: 15, color: '#374151' },
  check: { color: '#6366f1', fontWeight: '700' },
  noMore: { color: '#9ca3af', textAlign: 'center', padding: 16 },
  saveBtn: { marginTop: 16 },
  cancelBtn: { marginTop: 8, marginBottom: 40 },
});
