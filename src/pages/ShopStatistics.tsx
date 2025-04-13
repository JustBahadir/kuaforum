
import { useState, useEffect, useRef } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { islemServisi, kategoriServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Download, FileDown, FileText } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ComboChart } from "./ShopStatistics/components/ComboChart";
import { CategoryEvaluation } from "./ShopStatistics/components/CategoryEvaluation";
import { ServiceEvaluation } from "./ShopStatistics/components/ServiceEvaluation";
import { StatsDateControls } from "./ShopStatistics/components/StatsDateControls";
import { StatsHeader } from "./ShopStatistics/components/StatsHeader";
import { StatsSummaryCards } from "./ShopStatistics/components/StatsSummaryCards";
import { StatisticsCommentary } from "./ShopStatistics/components/StatisticsCommentary";

// Use module augmentation instead of a separate interface
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}

export default function ShopStatistics() {
  const { dukkanId, userRole } = useCustomerAuth();
  const [period, setPeriod] = useState("monthly");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [customMonthDay, setCustomMonthDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  const downloadRef = useRef(null);

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ["personnel-stats"],
    queryFn: personelServisi.hepsiniGetir,
  });

  const { data: operations = [], isLoading: operationsLoading } = useQuery({
    queryKey: ["operations-stats", dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        const data = await personelIslemleriServisi.hepsiniGetir();
        return data.filter((op) => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Failed to fetch operations data:", error);
        return [];
      }
    },
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services-stats"],
    queryFn: () => islemServisi.hepsiniGetir(),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: () => kategoriServisi.hepsiniGetir(),
  });

  const isLoading = operationsLoading || servicesLoading || personnelLoading || categoriesLoading;
  const hasData = operations.length > 0;

  const processedData = {
    operations,
    personnel,
    services,
    categories,
    dateRange
  };

  const exportToExcel = () => {
    if (!hasData) return;

    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Tarih Aralığı', `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`],
      ['Toplam İşlem Sayısı', operations.length],
      ['Toplam Ciro', formatCurrency(operations.reduce((sum, op) => sum + (op.tutar || 0), 0))],
      ['Ortalama İşlem', formatCurrency(operations.length ? operations.reduce((sum, op) => sum + (op.tutar || 0), 0) / operations.length : 0)],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Özet");

    const operationsData = [
      ['Tarih', 'İşlem', 'Personel', 'Müşteri', 'Tutar', 'Komisyon']
    ];
    operations.forEach(op => {
      const personelAdi = personnel.find(p => p.id === op.personel_id)?.ad_soyad || 'Bilinmeyen';
      const islemAdi = services.find(s => s.id === op.islem_id)?.islem_adi || op.aciklama || 'Bilinmeyen';
      const musteriAdi = op.musteri?.first_name || 'Bilinmeyen';
      
      operationsData.push([
        new Date(op.created_at).toLocaleDateString(),
        islemAdi,
        personelAdi,
        musteriAdi,
        op.tutar || 0,
        op.odenen || 0
      ]);
    });
    const operationsWs = XLSX.utils.aoa_to_sheet(operationsData);
    XLSX.utils.book_append_sheet(wb, operationsWs, "İşlemler");

    const personnelPerformanceData = [
      ['Personel', 'İşlem Sayısı', 'Ciro', 'Komisyon']
    ];
    const personnelMap = new Map();
    operations.forEach(op => {
      if (!op.personel_id) return;
      
      if (!personnelMap.has(op.personel_id)) {
        const person = personnel.find(p => p.id === op.personel_id);
        personnelMap.set(op.personel_id, { 
          name: person?.ad_soyad || 'Bilinmeyen', 
          count: 0, 
          revenue: 0,
          commission: 0 
        });
      }
      
      const entry = personnelMap.get(op.personel_id);
      entry.count += 1;
      entry.revenue += op.tutar || 0;
      entry.commission += op.odenen || 0;
    });
    
    Array.from(personnelMap.entries()).forEach(([_, data]) => {
      personnelPerformanceData.push([
        data.name,
        data.count,
        data.revenue,
        data.commission
      ]);
    });
    const personnelWs = XLSX.utils.aoa_to_sheet(personnelPerformanceData);
    XLSX.utils.book_append_sheet(wb, personnelWs, "Personel Performansı");

    XLSX.writeFile(wb, `Dukkan_Istatistikleri_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportToPdf = () => {
    if (!hasData) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Dükkan İstatistikleri Raporu', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Tarih Aralığı: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Özet Bilgiler', 14, 40);
    
    const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    const avgTicket = operations.length ? totalRevenue / operations.length : 0;
    
    doc.autoTable({
      startY: 45,
      head: [['Metrik', 'Değer']],
      body: [
        ['Toplam İşlem Sayısı', operations.length.toString()],
        ['Toplam Ciro', formatCurrency(totalRevenue)],
        ['Ortalama İşlem', formatCurrency(avgTicket)],
      ]
    });
    
    doc.setFontSize(16);
    doc.text('Personel Performans', 14, doc.lastAutoTable.finalY + 15);
    
    const personnelData = [];
    const personnelMap = new Map();
    
    operations.forEach(op => {
      if (!op.personel_id) return;
      
      if (!personnelMap.has(op.personel_id)) {
        const person = personnel.find(p => p.id === op.personel_id);
        personnelMap.set(op.personel_id, { 
          name: person?.ad_soyad || 'Bilinmeyen', 
          count: 0, 
          revenue: 0 
        });
      }
      
      const entry = personnelMap.get(op.personel_id);
      entry.count += 1;
      entry.revenue += op.tutar || 0;
    });
    
    Array.from(personnelMap.entries()).forEach(([_, data]) => {
      personnelData.push([data.name, data.count.toString(), formatCurrency(data.revenue)]);
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Personel', 'İşlem Sayısı', 'Ciro']],
      body: personnelData
    });
    
    if (doc.lastAutoTable.finalY < 220) {
      doc.setFontSize(16);
      doc.text('Hizmet Dağılımı', 14, doc.lastAutoTable.finalY + 15);
      
      const serviceData = [];
      const serviceMap = new Map();
      
      operations.forEach(op => {
        const serviceName = op.islem?.islem_adi || op.aciklama || 'Diğer';
        
        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, { count: 0, revenue: 0 });
        }
        
        const entry = serviceMap.get(serviceName);
        entry.count += 1;
        entry.revenue += op.tutar || 0;
      });
      
      Array.from(serviceMap.entries()).forEach(([name, data]) => {
        serviceData.push([name, data.count.toString(), formatCurrency(data.revenue)]);
      });
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Hizmet', 'İşlem Sayısı', 'Ciro']],
        body: serviceData
      });
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Rapor Tarihi: ${new Date().toLocaleDateString()} | Sayfa ${i} / ${pageCount}`,
        105, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }
    
    doc.save(`Dukkan_Istatistikleri_${new Date().toLocaleDateString()}.pdf`);
  };

  if (userRole !== "admin") {
    return (
      <StaffLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca yöneticiler
            dükkan istatistiklerini görüntüleyebilir.
          </AlertDescription>
        </Alert>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container mx-auto py-6 px-4">
        <StatsHeader title="Dükkan İstatistikleri">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={exportToExcel}
              disabled={!hasData || isLoading}
              title="Excel olarak indir"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={exportToPdf}
              disabled={!hasData || isLoading}
              title="PDF olarak indir"
              ref={downloadRef}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </StatsHeader>

        <StatsDateControls
          period={period}
          setPeriod={setPeriod}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customMonthDay={customMonthDay}
          setCustomMonthDay={setCustomMonthDay}
          useMonthCycle={useMonthCycle}
          setUseMonthCycle={setUseMonthCycle}
        />

        <StatisticsCommentary data={processedData} isLoading={isLoading} />

        <StatsSummaryCards data={processedData} isLoading={isLoading} />

        <ComboChart 
          data={processedData}
          isLoading={isLoading}
          period={period}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <CategoryEvaluation data={processedData} isLoading={isLoading} />
          <ServiceEvaluation data={processedData} isLoading={isLoading} />
        </div>
      </div>
    </StaffLayout>
  );
}
