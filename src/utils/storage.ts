import { Product, Sale, User } from '../types';

export const getProducts = (): Product[] => {
  const products = localStorage.getItem('beautyShopProducts');
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem('beautyShopProducts', JSON.stringify(products));
};

export const getSales = (): Sale[] => {
  const sales = localStorage.getItem('beautyShopSales');
  return sales ? JSON.parse(sales) : [];
};

export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem('beautyShopSales', JSON.stringify(sales));
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem('beautyShopUsers');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem('beautyShopUsers', JSON.stringify(users));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};