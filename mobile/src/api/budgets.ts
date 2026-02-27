import apiClient from './client';
import type { BudgetWithSpentDTO } from '../types/shared';

export async function getBudgets(month: string): Promise<BudgetWithSpentDTO[]> {
  const res = await apiClient.get<BudgetWithSpentDTO[]>('/budgets', { params: { month } });
  return res.data;
}

export async function createBudget(data: {
  category_id: number;
  month: string;
  amount: number;
}): Promise<BudgetWithSpentDTO> {
  const res = await apiClient.post<BudgetWithSpentDTO>('/budgets', data);
  return res.data;
}

export async function updateBudget(id: number, data: {
  amount?: number;
  month?: string;
  category_id?: number;
}): Promise<BudgetWithSpentDTO> {
  const res = await apiClient.put<BudgetWithSpentDTO>(`/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/budgets/${id}`);
}
