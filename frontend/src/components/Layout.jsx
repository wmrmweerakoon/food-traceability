import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return <>{children}</>;
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      ROLE_FARMER: 'Farmer',
      ROLE_DISTRIBUTOR: 'Distributor',
      ROLE_RETAILER: 'Retailer',
      ROLE_CONSUMER: 'Consumer',
      ROLE_ADMIN: 'Admin',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-green-600">
                Food Traceability
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.firstName} {user?.lastName}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

export default Layout;

