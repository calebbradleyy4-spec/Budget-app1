export interface UserDTO {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface CategoryDTO {
  id: number;
  user_id: number | null;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_default: boolean;
}

export interface TransactionDTO {
  id: number;
  user_id: number;
  category_id: number;
  category?: CategoryDTO;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  recurring_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  recurring_id?: number;
}

export interface TransactionListResponse {
  data: TransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BudgetDTO {
  id: number;
  user_id: number;
  category_id: number;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithSpentDTO extends BudgetDTO {
  category: CategoryDTO;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface CategorySpendDTO {
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrendDTO {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface MonthlySummaryDTO {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface RecurringRuleDTO {
  id: number;
  user_id: number;
  category_id: number;
  category?: CategoryDTO;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string | null;
  last_run_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringRuleInput {
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}
