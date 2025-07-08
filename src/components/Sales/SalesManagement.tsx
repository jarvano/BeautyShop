import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Calendar, DollarSign } from 'lucide-react';
import { Sale, Product } from '../../types';
import { getSales, saveSales, getProducts, saveProducts } from '../../utils/storage';
import { generateId } from '../../utils/storage';
import { exportToCSV } from '../../utils/export';
import { useAuth } from '../../context/AuthContext';
import AddSaleModal from './AddSaleModal';
import SalesTable from './SalesTable';

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, dateFilter, paymentFilter]);

  const loadData = () => {
    const salesData = getSales();
    const productsData = getProducts();
    setSales(salesData);
    setProducts(productsData);
  };

  const filterSales = () => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(sale => 
        new Date(sale.date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    if (paymentFilter) {
      filtered = filtered.filter(sale => sale.paymentMethod === paymentFilter);
    }

    setFilteredSales(filtered);
  };

  const handleAddSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    saveSales(updatedSales);

    // Update product stock
    const updatedProducts = products.map(product => {
      if (product.id === saleData.productId) {
        return { ...product, stock: product.stock - saleData.quantity };
      }
      return product;
    });
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    setShowAddModal(false);
  };

  const handleExport = () => {
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

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sales..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
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