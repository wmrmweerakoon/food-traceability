import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FarmerDashboard from './dashboards/FarmerDashboard';
import DistributorDashboard from './dashboards/DistributorDashboard';
import RetailerDashboard from './dashboards/RetailerDashboard';
import ConsumerDashboard from './dashboards/ConsumerDashboard';

function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'ROLE_FARMER':
        return <FarmerDashboard />;
      case 'ROLE_DISTRIBUTOR':
        return <DistributorDashboard />;
      case 'ROLE_RETAILER':
        return <RetailerDashboard />;
      case 'ROLE_CONSUMER':
        return <ConsumerDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Unknown role. Please contact support.</p>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
}

export default Dashboard;

