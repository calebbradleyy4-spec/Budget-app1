import { create } from 'zustand';
import * as txApi from '../api/transactions';
import type { TransactionDTO, TransactionListResponse, CreateTransactionInput } from '../types/shared';

interface TransactionsState {
  transactions: TransactionDTO[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (params?: { page?: number; limit?: number; type?: 'income' | 'expense'; category_id?: number; start_date?: string; end_date?: string }) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<TransactionDTO>;
  updateTransaction: (id: number, data: Partial<CreateTransactionInput>) => Promise<TransactionDTO>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await txApi.getTransactions(params);
      set({
        transactions: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load transactions', isLoading: false });
    }
  },

  createTransaction: async (data) => {
    const tx = await txApi.createTransaction(data);
    set((state) => ({ transactions: [tx, ...state.transactions], total: state.total + 1 }));
    return tx;
  },

  updateTransaction: async (id, data) => {
    const tx = await txApi.updateTransaction(id, data);
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? tx : t)),
    }));
    return tx;
  },

  deleteTransaction: async (id) => {
    await txApi.deleteTransaction(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      total: state.total - 1,
    }));
  },
}));
