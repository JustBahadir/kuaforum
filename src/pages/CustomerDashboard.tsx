
import { Outlet } from "react-router-dom";
import { CustomerLayout } from "@/components/ui/customer-layout";
import { CustomerDashboardHeader } from "@/components/customer/CustomerDashboardHeader";
import { CustomerDashboardSidebar } from "@/components/customer/CustomerDashboardSidebar";
import CustomerServices from "./CustomerDashboard/CustomerServices";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CustomerDashboardHeader />
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
        <div className="lg:col-span-1">
          <CustomerDashboardSidebar />
        </div>
      </div>
    </CustomerLayout>
  );
}
