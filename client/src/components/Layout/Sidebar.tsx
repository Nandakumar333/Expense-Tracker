import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import { Nav, Button } from 'react-bootstrap';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onToggle, onClose }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: 'bi-house-door', label: 'Dashboard' },
    { path: '/transactions', icon: 'bi-credit-card', label: 'Transactions' },
    { path: '/budget', icon: 'bi-wallet2', label: 'Budget' },
    { path: '/categories', icon: 'bi-tags', label: 'Categories' },
    { path: '/reports', icon: 'bi-bar-chart', label: 'Reports' },
    { path: '/settings', icon: 'bi-gear', label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`} 
        onClick={onClose}
      />
      <aside className={`
        sidebar 
        ${collapsed ? 'collapsed' : ''} 
        ${mobileOpen ? 'mobile-open' : ''}
      `}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-wallet2 text-primary fs-4"/>
            {!collapsed && <span className="ms-3">ExpenseTracker</span>}
          </div>
          <Button
            variant="link"
            className="sidebar-toggle"
            onClick={onToggle}
          >
            <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`}/>
          </Button>
        </div>

        <div className="sidebar-body">
          <Nav className="flex-column">
            {menuItems.map(item => (
              <Nav.Link
                key={item.path}
                as={NavLink}
                to={item.path}
                className="sidebar-link"
                onClick={handleLinkClick}
              >
                <i className={`bi ${item.icon}`}/>
                {!collapsed && <span>{item.label}</span>}
              </Nav.Link>
            ))}
          </Nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <i className="bi bi-person"/>
            </div>
            {!collapsed && (
              <>
                <div className="user-info">
                  <div className="user-name">{userProfile?.name || 'User'}</div>
                  <div className="user-email">{userProfile?.email}</div>
                </div>
                <Button
                  variant="link"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"/>
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
