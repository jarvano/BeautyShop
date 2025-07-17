import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesManagement from './components/Sales/SalesManagement';
import InventoryManagement from './components/Inventory/InventoryManagement';
import ReportsManagement from './components/Reports/ReportsManagement';
import UsersManagement from './components/Users/UsersManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sales':
        return <SalesManagement />;
      case 'inventory':
        return user?.role === 'admin' ? <InventoryManagement /> : null;
      case 'reports':
        return <ReportsManagement />;
      case 'users':
        return user?.role === 'admin' ? <UsersManagement /> : null;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;