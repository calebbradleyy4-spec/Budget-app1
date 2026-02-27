import apiClient from './client';
import type { TransactionDTO, TransactionListResponse, CreateTransactionInput } from '../types/shared';

interface ListParams {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function getTransactions(params: ListParams = {}): Promise<TransactionListResponse> {
  const res = await apiClient.get<TransactionListResponse>('/transactions', { params });
  return res.data;
}

export async function getTransaction(id: number): Promise<TransactionDTO> {
  const res = await apiClient.get<TransactionDTO>(`/transactions/${id}`);
  return res.data;
}

export async function createTransaction(data: CreateTransactionInput): Promise<TransactionDTO> {
  const res = await apiClient.post<TransactionDTO>('/transactions', data);
  return res.data;
}

export async function updateTransaction(id: number, data: Partial<CreateTransactionInput>): Promise<TransactionDTO> {
  const res = await apiClient.put<TransactionDTO>(`/transactions/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}
