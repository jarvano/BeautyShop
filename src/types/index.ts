export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
  email: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  description?: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  employeeId: string;
  employeeName: string;
  date: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface SalesReport {
  totalRevenue: number;
  totalItems: number;
  totalSales: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    mobile: number;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}