import apiClient from './client';
import type { CategorySpendDTO, MonthlyTrendDTO, MonthlySummaryDTO } from '../types/shared';

export async function getSpendingByCategory(month: string): Promise<CategorySpendDTO[]> {
  const res = await apiClient.get<CategorySpendDTO[]>('/reports/spending-by-category', {
    params: { month },
  });
  return res.data;
}

export async function getMonthlyTrend(months = 6): Promise<MonthlyTrendDTO[]> {
  const res = await apiClient.get<MonthlyTrendDTO[]>('/reports/monthly-trend', {
    params: { months },
  });
  return res.data;
}

export async function getMonthlySummary(month: string): Promise<MonthlySummaryDTO> {
  const res = await apiClient.get<MonthlySummaryDTO>('/reports/summary', {
    params: { month },
  });
  return res.data;
}
