import apiClient from './client';
import type { CategoryDTO } from '../types/shared';

export async function getCategories(): Promise<CategoryDTO[]> {
  const res = await apiClient.get<CategoryDTO[]>('/categories');
  return res.data;
}

export async function createCategory(data: {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}): Promise<CategoryDTO> {
  const res = await apiClient.post<CategoryDTO>('/categories', data);
  return res.data;
}

export async function updateCategory(id: number, data: Partial<{
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}>): Promise<CategoryDTO> {
  const res = await apiClient.put<CategoryDTO>(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
