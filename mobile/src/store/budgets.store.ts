import { create } from 'zustand';
import * as budgetsApi from '../api/budgets';
import type { BudgetWithSpentDTO } from '../types/shared';
import { toYYYYMM } from '../utils/date';

interface BudgetsState {
  budgets: BudgetWithSpentDTO[];
  selectedMonth: string;
  isLoading: boolean;
  error: string | null;

  setMonth: (month: string) => void;
  fetchBudgets: (month?: string) => Promise<void>;
  createBudget: (data: { category_id: number; month: string; amount: number }) => Promise<BudgetWithSpentDTO>;
  updateBudget: (id: number, data: { amount?: number }) => Promise<BudgetWithSpentDTO>;
  deleteBudget: (id: number) => Promise<void>;
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  selectedMonth: toYYYYMM(),
  isLoading: false,
  error: null,

  setMonth: (month) => set({ selectedMonth: month }),

  fetchBudgets: async (month) => {
    const m = month || get().selectedMonth;
    set({ isLoading: true, error: null });
    try {
      const data = await budgetsApi.getBudgets(m);
      set({ budgets: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load budgets', isLoading: false });
    }
  },

  createBudget: async (data) => {
    const budget = await budgetsApi.createBudget(data);
    set((state) => ({ budgets: [...state.budgets, budget] }));
    return budget;
  },

  updateBudget: async (id, data) => {
    const budget = await budgetsApi.updateBudget(id, data);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? budget : b)),
    }));
    return budget;
  },

  deleteBudget: async (id) => {
    await budgetsApi.deleteBudget(id);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },
}));
