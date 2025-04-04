import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <Link to="/dashboard" className="navbar-brand">Expense Tracker</Link>
        <div className="ms-auto">
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="btn btn-link p-0" 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div 
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            </button>
            <ul className={`dropdown-menu dropdown-menu-end${isDropdownOpen ? ' show' : ''}`}>
              <li><button className="dropdown-item" onClick={handleProfile}>View Profile</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
