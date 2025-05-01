
import React from 'react';
import { StaffLayout } from '@/components/ui/staff-layout';
import { StatisticsData } from './components/StatisticsData';

export default function ShopStatistics() {
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">İşletme İstatistikleri</h1>
        
        <StatisticsData />
      </div>
    </StaffLayout>
  );
}
