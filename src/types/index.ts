export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock_qty: number;
  cost_price: number;
  selling_price: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  amount: number;
  date: string;
  employee_id: string;
  employee_name: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SalesReport {
  totalRevenue: number;
  totalItems: number;
  totalSales: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}