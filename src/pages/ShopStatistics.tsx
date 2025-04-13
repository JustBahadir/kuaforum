
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

// Create declarations for the extended jsPDF type with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        height: number;
        getWidth(): number;
        getHeight(): number;
      };
      pages: number[];
      getNumberOfPages(): number;
      getEncryptor(objectId: number): (data: string) => string;
    };
  }
}

export default function ShopStatistics() {
  const { dukkanAdi } = useCustomerAuth();
  const [activeView, setActiveView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample data for demonstration
  const sampleData = [
    { date: '2023-01-01', revenue: 1500, customers: 12, services: 15 },
    { date: '2023-01-02', revenue: 1200, customers: 9, services: 11 },
    { date: '2023-01-03', revenue: 1800, customers: 15, services: 18 },
    { date: '2023-01-04', revenue: 900, customers: 7, services: 8 },
    { date: '2023-01-05', revenue: 2200, customers: 18, services: 22 },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Function to export statistics as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const shopName = dukkanAdi || 'Dükkan';
    
    // Add shop name and title
    doc.setFontSize(20);
    doc.text(shopName, 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('İstatistik Raporu', 105, 25, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Rapor tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 105, 35, { align: 'center' });
    
    // Generate table
    doc.autoTable({
      head: [['Tarih', 'Gelir', 'Müşteri Sayısı', 'Hizmet Sayısı']],
      body: sampleData.map(row => [
        row.date,
        formatCurrency(row.revenue),
        row.customers,
        row.services
      ]),
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [75, 0, 130] }
    });
    
    // Calculate totals
    const totalRevenue = sampleData.reduce((sum, row) => sum + row.revenue, 0);
    const totalCustomers = sampleData.reduce((sum, row) => sum + row.customers, 0);
    const totalServices = sampleData.reduce((sum, row) => sum + row.services, 0);
    
    // Add totals row
    const finalY = (doc.previousAutoTable?.finalY || 40) + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Toplam:', 20, finalY);
    doc.text(formatCurrency(totalRevenue), 70, finalY);
    doc.text(totalCustomers.toString(), 120, finalY);
    doc.text(totalServices.toString(), 170, finalY);
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Sayfa ${i} / ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`${shopName}_istatistik_raporu.pdf`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dükkan İstatistikleri</h1>
        <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          PDF İndir
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(7600)}</div>
            <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Müşteri Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">61</div>
            <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hizmet Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74</div>
            <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Görünüm Seçin</h2>
        <div className="flex space-x-2">
          <Button 
            variant={activeView === 'daily' ? 'default' : 'outline'} 
            onClick={() => setActiveView('daily')}
          >
            Günlük
          </Button>
          <Button 
            variant={activeView === 'weekly' ? 'default' : 'outline'} 
            onClick={() => setActiveView('weekly')}
          >
            Haftalık
          </Button>
          <Button 
            variant={activeView === 'monthly' ? 'default' : 'outline'} 
            onClick={() => setActiveView('monthly')}
          >
            Aylık
          </Button>
          <Button 
            variant={activeView === 'yearly' ? 'default' : 'outline'} 
            onClick={() => setActiveView('yearly')}
          >
            Yıllık
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">
          {activeView === 'daily' && 'Günlük İstatistikler'}
          {activeView === 'weekly' && 'Haftalık İstatistikler'}
          {activeView === 'monthly' && 'Aylık İstatistikler'}
          {activeView === 'yearly' && 'Yıllık İstatistikler'}
        </h2>
        
        <p className="text-gray-500">
          Bu bölüm seçilen zaman aralığına göre detaylı istatistikleri gösterecektir.
        </p>
      </div>
    </div>
  );
}
