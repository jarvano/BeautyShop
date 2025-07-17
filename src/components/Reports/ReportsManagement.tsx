import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, BarChart3, DollarSign, Package, CreditCard } from 'lucide-react';
import { getSales, getProducts } from '../../utils/storage';
import { Sale, Product, SalesReport } from '../../types';
import { exportSalesToCSV, exportProductsToCSV } from '../../utils/export';

const ReportsManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sales.length > 0) {
      generateReport();
    }
  }, [sales, startDate, endDate, reportType]);

  const loadData = () => {
    setSales(getSales());
    setProducts(getProducts());
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

    const paymentBreakdown = filteredSales.reduce((acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalItems,
      totalSales,
      topProducts,
      paymentBreakdown: {
        cash: paymentBreakdown.cash || 0,
        card: paymentBreakdown.card || 0,
        mobile: paymentBreakdown.mobile || 0
      }
    };
  };

  const handleExportSales = () => {
    const filteredSales = sales.filter(sale => {
      if (!startDate || !endDate) return true;
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    exportSalesToCSV(filteredSales);
  };

  const handleExportInventory = () => {
    exportProductsToCSV(products);
  };

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

      {/* Payment Breakdown and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Cash</span>
              </div>
              <span className="font-medium">${report?.paymentBreakdown.cash.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Card</span>
              </div>
              <span className="font-medium">${report?.paymentBreakdown.card.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Mobile</span>
              </div>
              <span className="font-medium">${report?.paymentBreakdown.mobile.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

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
      </div>

      {/* Inventory Status */}
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
  );
};

export default ReportsManagement;