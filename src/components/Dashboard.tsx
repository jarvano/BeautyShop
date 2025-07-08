import React, { useState, useEffect } from 'react';
import { getSales, getProducts } from '../utils/storage';
import { generateSalesReport } from '../utils/export';
import { TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [todaysSales, setTodaysSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);

  useEffect(() => {
    const sales = getSales();
    const products = getProducts();
    
    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
    
    setTodaysSales(todaySales.length);
    setTotalProducts(products.length);
    setLowStockItems(products.filter(p => p.stock <= p.lowStockThreshold).length);
    setTodaysRevenue(todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0));
  }, []);

  const stats = [
    {
      name: "Today's Sales",
      value: todaysSales,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: "Today's Revenue",
      value: `$${todaysRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Low Stock Items',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 mr-4" />
          <div>
            <h2 className="text-xl font-bold">Welcome to Beauty Shop Manager!</h2>
            <p className="text-purple-100 mt-1">
              Manage your beauty shop efficiently with our comprehensive system for sales, inventory, and reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
            <ShoppingCart className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Record New Sale</h4>
            <p className="text-sm text-gray-600">Add a new sale transaction</p>
          </div>
          <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
            <Package className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add Product</h4>
            <p className="text-sm text-gray-600">Add new products to inventory</p>
          </div>
          <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Reports</h4>
            <p className="text-sm text-gray-600">Check sales and inventory reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;