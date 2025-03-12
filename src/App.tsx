
import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import StaffLogin from './pages/StaffLogin';
import StaffRegister from './pages/StaffRegister';
import CreateShop from './pages/CreateShop';
import ShopHomePage from './pages/ShopHomePage';
import ShopSettings from './pages/ShopSettings';
import NotFound from './pages/NotFound';
import Appointments from './pages/Appointments';
import Customers from './pages/Customers';
import Services from './pages/Services';
import CustomerDashboard from './pages/CustomerDashboard';
import Settings from './pages/Settings';
import ShopStatistics from './pages/ShopStatistics';
import StaffProfile from './pages/StaffProfile';
import Personnel from './pages/Personnel';
import OperationsHistory from './pages/OperationsHistory';
import MyPerformance from './pages/MyPerformance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/staff-register" element={<StaffRegister />} />
      <Route path="/create-shop" element={<CreateShop />} />
      <Route path="/shop-home" element={<ShopHomePage />} />
      <Route path="/shop-settings" element={<ShopSettings />} />
      <Route path="/shop-statistics" element={<ShopStatistics />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/admin/operations" element={<Services />} />
      <Route path="/operations-history" element={<OperationsHistory />} />
      <Route path="/my-performance" element={<MyPerformance />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/staff-profile" element={<StaffProfile />} />
      <Route path="/personnel" element={<Personnel />} />
      <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
