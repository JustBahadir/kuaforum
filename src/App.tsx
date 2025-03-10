
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import { RouteProtection } from './components/auth/RouteProtection';
import CustomerProfile from './pages/CustomerProfile';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import StaffRegister from './pages/StaffRegister';
import CreateShop from './pages/CreateShop';
import ShopHomePage from './pages/ShopHomePage';
import StaffProfile from './pages/StaffProfile';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import CustomerOperations from './pages/operations/CustomerOperations';
import StaffOperations from './pages/operations/StaffOperations';
import Appointments from './pages/Appointments';
import Personnel from './pages/Personnel';
import Customers from './pages/Customers';
import ShopSettings from './pages/ShopSettings';
import OperationsHistory from './pages/OperationsHistory';
import ShopStatistics from './pages/ShopStatistics';
import { createOperationPhotosBucket } from './lib/supabase/init/createStorageBucket';

function App() {
  useEffect(() => {
    // Initialize storage bucket for operation photos
    createOperationPhotosBucket();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-register" element={<StaffRegister />} />
        <Route path="/create-shop" element={<CreateShop />} />
        <Route path="/shop-home" element={<ShopHomePage />} />
        
        {/* Protected routes - require authentication */}
        <Route element={<RouteProtection />}>
          <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/staff-profile" element={<StaffProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/customer-operations" element={<CustomerOperations />} />
          <Route path="/staff-operations" element={<StaffOperations />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/shop-settings" element={<ShopSettings />} />
          <Route path="/operations-history" element={<OperationsHistory />} />
          <Route path="/shop-statistics" element={<ShopStatistics />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
