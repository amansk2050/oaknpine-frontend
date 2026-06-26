export interface BookingExpense {
  id: string;
  category: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  bookingId?: string;
  packageBookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  category: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  bookingId?: string;
  packageBookingId?: string;
}

export interface UpdateExpenseDto {
  category?: string;
  title?: string;
  description?: string;
  amount?: number;
  expenseDate?: string;
  bookingId?: string;
  packageBookingId?: string;
}

export interface ExpenseStatistics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}
