import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Profile from './pages/Profile/Profile';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import BudgetPage from './pages/Budget/BudgetPage';
import CategoryPage from './pages/Categories/CategoryPage';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: window.innerWidth < 992,
    isMobileOpen: false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setSidebarState(prev => ({
        isCollapsed: width < 992 ? true : prev.isCollapsed,
        isMobileOpen: width >= 992 ? false : prev.isMobileOpen
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 992) {
      setSidebarState(prev => ({
        ...prev,
        isMobileOpen: !prev.isMobileOpen
      }));
      document.body.style.overflow = sidebarState.isMobileOpen ? 'auto' : 'hidden';
    } else {
      setSidebarState(prev => ({
        ...prev,
        isCollapsed: !prev.isCollapsed
      }));
    }
  };

  const handleSidebarClose = () => {
    setSidebarState(prev => ({
      ...prev,
      isMobileOpen: false
    }));
    document.body.style.overflow = 'auto';
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <Navbar 
        fixed="top" 
        bg="white" 
        className="d-lg-none border-bottom app-header"
      >
        <Container fluid>
          <Button 
            variant="link"
            className="sidebar-toggle p-0"
            onClick={handleSidebarToggle}
          >
            <i className="bi bi-list fs-4"/>
          </Button>
          <Navbar.Brand className="mx-auto d-flex align-items-center">
            <i className="bi bi-wallet2 text-primary me-2"/>
            ExpenseTracker
          </Navbar.Brand>
          <div style={{width: '40px'}}/>
        </Container>
      </Navbar>

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarState.isCollapsed}
        mobileOpen={sidebarState.isMobileOpen}
        onToggle={handleSidebarToggle}
        onClose={handleSidebarClose}
      />

      {/* Main Content */}
      <main className={`
        app-main 
        ${sidebarState.isCollapsed ? 'sidebar-collapsed' : ''} 
        ${sidebarState.isMobileOpen ? 'sidebar-mobile-open' : ''}
      `}>
        <Container fluid className="h-100 py-4 px-lg-4 px-3">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Container>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;