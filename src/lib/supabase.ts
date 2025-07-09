import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'admin' | 'employee';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: 'admin' | 'employee';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'admin' | 'employee';
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          stock_qty: number;
          cost_price: number;
          selling_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          stock_qty: number;
          cost_price: number;
          selling_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          stock_qty?: number;
          cost_price?: number;
          selling_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          amount: number;
          date: string;
          employee_id: string;
          employee_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_name: string;
          quantity: number;
          amount: number;
          date?: string;
          employee_id: string;
          employee_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          amount?: number;
          date?: string;
          employee_id?: string;
          employee_name?: string;
          created_at?: string;
        };
      };
    };
  };
};