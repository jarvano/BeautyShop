import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, Package, CreditCard } from 'lucide-react';
import { Sale, Product } from '../../types';
import { getSales, getProducts } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import AddSaleModal from './AddSaleModal';
import SalesTable from './SalesTable';
import { exportSalesToCSV } from '../../utils/export';

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, dateFilter, employeeFilter]);

  const loadData = () => {
    setSales(getSales());
    setProducts(getProducts());
  };

  const filterSales = () => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(sale => 
        new Date(sale.date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    if (employeeFilter) {
      filtered = filtered.filter(sale => sale.employee_name === employeeFilter);
    }

    setFilteredSales(filtered);
  };

  const handleAddSale = () => {
    loadData();
    setShowAddModal(false);
  };

  const handleExport = () => {
    exportSalesToCSV(filteredSales);
  };

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  const paymentBreakdown = filteredSales.reduce((acc, sale) => {
    acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.amount;
    return acc;
  }, {} as Record<string, number>);

  const employees = [...new Set(sales.map(s => s.employee_name))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Sale</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${(paymentBreakdown.cash || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${(paymentBreakdown.card || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Card</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(paymentBreakdown.mobile || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Mobile</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sales..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee} value={employee}>{employee}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <SalesTable sales={filteredSales} />

      {/* Add Sale Modal */}
      {showAddModal && (
        <AddSaleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSale}
          products={products}
          currentUser={user!}
        />
      )}
    </div>
  );
};

export default SalesManagement;