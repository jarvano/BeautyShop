import { User, Product, Sale } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'beauty_shop_users',
  PRODUCTS: 'beauty_shop_products',
  SALES: 'beauty_shop_sales',
  CURRENT_USER: 'beauty_shop_current_user'
};

// Initialize default data
const initializeDefaultData = () => {
  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      email: 'admin@beautyshop.com',
      name: 'Admin User',
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'employee1@beautyshop.com',
      name: 'Sarah Johnson',
      role: 'employee',
      created_at: new Date().toISOString()
    }
  ];

  // Default products
  const defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Moisturizing Face Cream',
      category: 'Skincare',
      stock_qty: 25,
      cost_price: 15.00,
      selling_price: 29.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lipstick - Ruby Red',
      category: 'Makeup',
      stock_qty: 12,
      cost_price: 8.00,
      selling_price: 18.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Shampoo - Argan Oil',
      category: 'Haircare',
      stock_qty: 3,
      cost_price: 12.00,
      selling_price: 24.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Foundation - Medium',
      category: 'Makeup',
      stock_qty: 8,
      cost_price: 20.00,
      selling_price: 39.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Perfume - Floral Essence',
      category: 'Fragrance',
      stock_qty: 0,
      cost_price: 25.00,
      selling_price: 59.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Initialize if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
  }
};

// User management
export const getUsers = (): User[] => {
  initializeDefaultData();
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const addUser = (user: Omit<User, 'id' | 'created_at'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(user => user.id !== userId);
  saveUsers(users);
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
};

// Product management
export const getProducts = (): Product[] => {
  initializeDefaultData();
  const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const addProduct = (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (productId: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(product => product.id === productId);
  if (index !== -1) {
    products[index] = { 
      ...products[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    saveProducts(products);
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter(product => product.id !== productId);
  saveProducts(products);
};

// Sales management
export const getSales = (): Sale[] => {
  initializeDefaultData();
  const sales = localStorage.getItem(STORAGE_KEYS.SALES);
  return sales ? JSON.parse(sales) : [];
};

export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const addSale = (sale: Omit<Sale, 'id' | 'created_at'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  sales.push(newSale);
  saveSales(sales);

  // Update product stock
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === sale.product_id);
  if (productIndex !== -1) {
    products[productIndex].stock_qty -= sale.quantity;
    products[productIndex].updated_at = new Date().toISOString();
    saveProducts(products);
  }

  return newSale;
};

// Authentication
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  
  // Demo credentials
  const demoCredentials = [
    { email: 'admin@beautyshop.com', password: 'admin123' },
    { email: 'employee1@beautyshop.com', password: 'emp123' }
  ];

  const isValidDemo = demoCredentials.some(cred => 
    cred.email === email && cred.password === password
  );

  if (isValidDemo) {
    const user = users.find(u => u.email === email);
    return user || null;
  }

  return null;
};