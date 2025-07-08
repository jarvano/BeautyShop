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
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sales':
        return <SalesManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'users':
        return user?.role === 'admin' ? <UsersManagement /> : <Dashboard />;
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