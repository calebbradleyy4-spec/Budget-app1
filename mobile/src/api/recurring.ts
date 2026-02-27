import apiClient from './client';
import type { RecurringRuleDTO, CreateRecurringRuleInput } from '../types/shared';

export async function getRecurringRules(): Promise<RecurringRuleDTO[]> {
  const res = await apiClient.get<RecurringRuleDTO[]>('/recurring');
  return res.data;
}

export async function getRecurringRule(id: number): Promise<RecurringRuleDTO> {
  const res = await apiClient.get<RecurringRuleDTO>(`/recurring/${id}`);
  return res.data;
}

export async function createRecurringRule(data: CreateRecurringRuleInput): Promise<RecurringRuleDTO> {
  const res = await apiClient.post<RecurringRuleDTO>('/recurring', data);
  return res.data;
}

export async function updateRecurringRule(
  id: number,
  data: Partial<CreateRecurringRuleInput> & { is_active?: boolean }
): Promise<RecurringRuleDTO> {
  const res = await apiClient.put<RecurringRuleDTO>(`/recurring/${id}`, data);
  return res.data;
}

export async function deleteRecurringRule(id: number): Promise<void> {
  await apiClient.delete(`/recurring/${id}`);
}
