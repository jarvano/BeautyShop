import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, BarChart3, DollarSign, Package } from 'lucide-react';
import { getSales, getProducts } from '../../utils/storage';
import { generateSalesReport, exportToCSV } from '../../utils/export';
import { Sale, Product, SalesReport } from '../../types';

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
    const salesData = getSales();
    const productsData = getProducts();
    setSales(salesData);
    setProducts(productsData);
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

  const handleExportSales = () => {
    const filteredSales = sales.filter(sale => {
      if (!startDate || !endDate) return true;
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    const exportData = filteredSales.map(sale => ({
      Date: new Date(sale.date).toLocaleDateString(),
      Product: sale.productName,
      Quantity: sale.quantity,
      'Unit Price': sale.unitPrice,
      'Total Amount': sale.totalAmount,
      'Payment Method': sale.paymentMethod,
      Employee: sale.employeeName
    }));

    exportToCSV(exportData, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportInventory = () => {
    const exportData = products.map(product => ({
      Name: product.name,
      Category: product.category,
      'Cost Price': product.costPrice,
      'Selling Price': product.sellingPrice,
      Stock: product.stock,
      'Low Stock Threshold': product.lowStockThreshold,
      Status: product.stock === 0 ? 'Out of Stock' : 
              product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock'
    }));

    exportToCSV(exportData, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

      {/* Payment Breakdown */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash</span>
                <span className="font-medium">${report.paymentBreakdown.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Card</span>
                <span className="font-medium">${report.paymentBreakdown.card.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile</span>
                <span className="font-medium">${report.paymentBreakdown.mobile.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-3">
              {report.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({product.quantity} sold)</span>
                  </div>
                  <span className="font-medium">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
              {report.topProducts.length === 0 && (
                <p className="text-sm text-gray-500">No sales data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.stock > p.lowStockThreshold).length}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;