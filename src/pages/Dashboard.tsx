
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainMenuOptions } from '@/pages/Dashboard/components/MainMenuOptions';
import { CustomerMenu } from '@/pages/Dashboard/components/CustomerMenu';
import { PersonnelMenu } from '@/pages/Dashboard/components/PersonnelMenu';
import { ProfitAnalysis } from '@/components/dashboard/ProfitAnalysis';
import { BusinessReports } from '@/components/dashboard/BusinessReports';
import { TestDataButton } from '@/pages/Dashboard/components/TestDataButton';

// Create interfaces for the wrapper components
interface GreetingWrapperProps {
  className?: string;
}

interface MainMenuWrapperProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

interface TestDataButtonWrapperProps {
  onSuccess: () => void;
}

// Create a custom Greeting component that takes className
const GreetingWrapper: React.FC<GreetingWrapperProps> = ({className}) => {
  const { user, loading } = useAuth();
  
  return (
    <div className={className || ""}>
      <h1 className="text-4xl font-bold">Hoş Geldiniz</h1>
      <p className="text-muted-foreground mt-1">
        {user?.user_metadata?.firstName ? `${user.user_metadata.firstName}` : "Sayın Kullanıcı"}
      </p>
    </div>
  );
};

// Create a wrapper for MainMenuOptions to handle the setActiveTab prop
const MainMenuWrapper: React.FC<MainMenuWrapperProps> = ({
  setActiveTab
}) => {
  // Only add onMenuSelect if MainMenuOptions supports it
  const handleMenuSelect = (tab: string) => {
    setActiveTab(tab);
  };
  
  return <MainMenuOptions onMenuSelect={handleMenuSelect} />;
};

// Create a wrapper for TestDataButton to handle the onSuccess prop
const TestDataButtonWrapper: React.FC<TestDataButtonWrapperProps> = ({onSuccess}) => {
  return <TestDataButton onGenerateSuccess={onSuccess} />;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('main');
  const [showTestDataButton, setShowTestDataButton] = useState(true);

  // Get user role from user metadata
  const userRole = user?.user_metadata?.role;
  
  // Fetch operations for profit analysis
  const { data: operations = [] } = useQuery({
    queryKey: ['operations-for-profits'],
    queryFn: async () => {
      // Implement your data fetching logic here
      return [];
    },
    enabled: userRole === 'admin',
  });

  // Fetch fixed expenses
  const { data: fixedExpenses = [] } = useQuery({
    queryKey: ['fixed-expenses'],
    queryFn: async () => {
      // Implement your data fetching logic here
      return [];
    },
    enabled: userRole === 'admin',
  });

  // Fetch monthly appointments
  const { data: monthlyAppointments = [] } = useQuery({
    queryKey: ['monthly-appointments'],
    queryFn: async () => {
      // Implement your data fetching logic here
      return [];
    },
    enabled: userRole === 'admin',
  });

  const handleBackClick = () => {
    setActiveTab('main');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Convert arrays to numbers for ProfitAnalysis component - fixing this issue
  const operationsData = operations.length || 0;
  const expensesData = fixedExpenses.length || 0;
  const appointmentsData = monthlyAppointments.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <GreetingWrapper className="mb-8" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full max-w-md mb-4 grid grid-cols-3">
          <TabsTrigger value="main">Ana Menü</TabsTrigger>
          <TabsTrigger value="personnel">Personel</TabsTrigger>
          <TabsTrigger value="customer">Müşteri</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <MainMenuWrapper setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="personnel">
          <PersonnelMenu onBackClick={handleBackClick} />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerMenu onBackClick={handleBackClick} />
        </TabsContent>
      </Tabs>

      {userRole === 'admin' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>İşletme Raporları</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessReports />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kar Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitAnalysis 
                operations={operationsData} 
                fixedExpenses={expensesData} 
                monthlyAppointments={appointmentsData}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {showTestDataButton && userRole === 'admin' && (
        <div className="mt-8">
          <TestDataButtonWrapper onSuccess={() => setShowTestDataButton(false)} />
        </div>
      )}
    </div>
  );
}
