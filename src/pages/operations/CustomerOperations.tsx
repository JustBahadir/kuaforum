import React from 'react';
import { MainLayout } from "@/layouts/MainLayout";
import { useOperations } from "@/hooks/useOperations";
import { ServiceList } from "@/components/operations/ServiceList";

const CustomerOperations = () => {
  const { islemler, isLoading } = useOperations();

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Hizmetlerimiz</h1>
        <ServiceList islemler={islemler} isLoading={isLoading} />
      </div>
    </MainLayout>
  );
};

export default CustomerOperations;
