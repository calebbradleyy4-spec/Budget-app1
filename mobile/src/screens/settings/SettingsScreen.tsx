import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { getRecurringRules, updateRecurringRule, deleteRecurringRule, createRecurringRule } from '../../api/recurring';
import { useCategoriesStore } from '../../store/categories.store';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { RecurringRuleDTO } from '../../types/shared';
import { formatCurrency } from '../../utils/currency';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { categories, fetchCategories } = useCategoriesStore();

  const [rules, setRules] = useState<RecurringRuleDTO[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadRules() {
    try {
      const data = await getRecurringRules();
      setRules(data);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadRules();
    fetchCategories();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadRules();
    setRefreshing(false);
  }

  async function handleToggle(rule: RecurringRuleDTO) {
    try {
      const updated = await updateRecurringRule(rule.id, { is_active: !rule.is_active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to update');
    }
  }

  function handleDeleteRule(id: number) {
    Alert.alert('Delete Rule', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecurringRule(id);
            setRules((prev) => prev.filter((r) => r.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to delete');
          }
        },
      },
    ]);
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* User Info */}
      <Card>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Recurring Rules */}
      <Card>
        <Text style={styles.cardTitle}>Recurring Rules</Text>
        {rules.length === 0 ? (
          <Text style={styles.empty}>No recurring rules set up</Text>
        ) : (
          rules.map((rule) => (
            <View key={rule.id} style={styles.ruleRow}>
              <View style={styles.ruleInfo}>
                <Text style={styles.ruleName}>
                  {rule.description || rule.category?.name || 'Rule'}
                  {' '}
                  <Text style={rule.type === 'income' ? styles.income : styles.expense}>
                    ({rule.type})
                  </Text>
                </Text>
                <Text style={styles.ruleDetails}>
                  {formatCurrency(rule.amount)} · {rule.frequency}
                </Text>
              </View>
              <View style={styles.ruleActions}>
                <Switch
                  value={rule.is_active}
                  onValueChange={() => handleToggle(rule)}
                  trackColor={{ true: '#6366f1', false: '#d1d5db' }}
                  thumbColor="#fff"
                />
                <TouchableOpacity onPress={() => handleDeleteRule(rule.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Logout */}
      <Button
        title="Logout"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  userName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  empty: { color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  ruleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  ruleInfo: { flex: 1 },
  ruleName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  ruleDetails: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  income: { color: '#22c55e' },
  expense: { color: '#ef4444' },
  ruleActions: { flexDirection: 'row', alignItems: 'center', gap: 8 } as any,
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  logoutBtn: { marginTop: 8 },
});
