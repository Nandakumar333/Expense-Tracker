import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Account Profile</h4>
              <button 
                className="btn btn-outline-light" 
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="avatar-placeholder rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person fs-1"></i>
                </div>
                <h5 className="mb-0">{userProfile?.name}</h5>
                <p className="text-muted">{userProfile?.email}</p>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-currency-exchange me-2"></i>
                        Currency
                      </h6>
                      <p className="card-text">{userProfile?.currency}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-palette me-2"></i>
                        Theme
                      </h6>
                      <p className="card-text">{userProfile?.theme}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
