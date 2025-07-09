import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, BarChart3, DollarSign, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Sale, Product, SalesReport } from '../../types';

const ReportsManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sales.length > 0) {
      generateReport();
    }
  }, [sales, startDate, endDate, reportType]);

  const loadData = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

      if (salesError) throw salesError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      setSales(salesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    let filteredStartDate = startDate;
    let filteredEndDate = endDate;

    const now = new Date();
    
    switch (reportType) {
      case 'daily':
        filteredStartDate = now.toISOString().split('T')[0];
        filteredEndDate = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filteredStartDate = weekStart.toISOString().split('T')[0];
        filteredEndDate = now.toISOString().split('T')[0];
        break;
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredStartDate = monthStart.toISOString().split('T')[0];
        filteredEndDate = now.toISOString().split('T')[0];
        break;
    }

    const reportData = generateSalesReport(sales, filteredStartDate, filteredEndDate);
    setReport(reportData);
  };

  const generateSalesReport = (sales: Sale[], startDate?: string, endDate?: string): SalesReport => {
    let filteredSales = sales;

    if (startDate && endDate) {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
      });
    }

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalSales = filteredSales.length;

    const productSales = filteredSales.reduce((products, sale) => {
      const existing = products.find(p => p.name === sale.product_name);
      if (existing) {
        existing.quantity += sale.quantity;
        existing.revenue += sale.amount;
      } else {
        products.push({
          name: sale.product_name,
          quantity: sale.quantity,
          revenue: sale.amount
        });
      }
      return products;
    }, [] as Array<{ name: string; quantity: number; revenue: number }>);

    const topProducts = productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      totalRevenue,
      totalItems,
      totalSales,
      topProducts
    };
  };

  const handleExportSales = () => {
    const filteredSales = sales.filter(sale => {
      if (!startDate || !endDate) return true;
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    const csvContent = [
      'Date,Product,Quantity,Amount,Employee',
      ...filteredSales.map(sale => 
        `${new Date(sale.date).toLocaleDateString()},${sale.product_name},${sale.quantity},${sale.amount},${sale.employee_name}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportInventory = () => {
    const csvContent = [
      'Name,Category,Stock Quantity,Cost Price,Selling Price,Status',
      ...products.map(product => 
        `${product.name},${product.category},${product.stock_qty},${product.cost_price},${product.selling_price},${
          product.stock_qty === 0 ? 'Out of Stock' : 
          product.stock_qty < 5 ? 'Low Stock' : 'In Stock'
        }`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={handleExportSales}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Sales
          </button>
          <button
            onClick={handleExportInventory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Inventory
          </button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {reportType === 'custom' && (
              <>
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${report.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{report.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{report.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Sale</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${report.totalSales > 0 ? (report.totalRevenue / report.totalSales).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Products and Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {report?.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({product.quantity} sold)</span>
                </div>
                <span className="font-medium">${product.revenue.toFixed(2)}</span>
              </div>
            ))}
            {(!report?.topProducts || report.topProducts.length === 0) && (
              <p className="text-sm text-gray-500">No sales data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock_qty >= 5).length}
              </div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock_qty < 5 && p.stock_qty > 0).length}
              </div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock_qty === 0).length}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;