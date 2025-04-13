import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Add module augmentation for jsPDF to include autoTable and related properties
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
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
    };
  }
}

interface ShopStatisticsProps {
  shopId: number;
}

export default function ShopStatistics({ shopId }: ShopStatisticsProps) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);
    try {
      // Create a new PDF document with A4 size
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add shop information to the header
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('Salon Statistics Report', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${format(new Date(), 'PPP', { locale: tr })}`, 105, 22, { align: 'center' });
      doc.text(`Shop ID: ${shopId}`, 105, 28, { align: 'center' });
      
      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);
      
      // Performance Summary Section
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Performance Summary', 20, 40);
      
      // Sample performance data
      const performanceData = [
        ['Last Month Revenue', '15,245 TL'],
        ['Monthly Growth', '+12%'],
        ['Most Popular Service', 'Hair Coloring'],
        ['Average Rating', '4.7/5'],
      ];
      
      doc.autoTable({
        startY: 45,
        head: [['Metric', 'Value']],
        body: performanceData,
        theme: 'grid',
        headStyles: { 
          fillColor: [79, 129, 189],
          textColor: 255,
        },
        styles: { 
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: 20, right: 20 },
      });
      
      // Staff Performance Section
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Staff Performance', 20, doc.lastAutoTable.finalY + 15);
      
      // Sample staff performance data
      const staffData = [
        ['Ayşe Yılmaz', '45', '12,450 TL', '4.9/5'],
        ['Mehmet Kaya', '32', '10,320 TL', '4.7/5'],
        ['Zeynep Demir', '38', '11,680 TL', '4.8/5'],
        ['Ali Öztürk', '28', '8,950 TL', '4.6/5'],
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Staff Name', 'Appointments', 'Revenue', 'Rating']],
        body: staffData,
        theme: 'striped',
        headStyles: { 
          fillColor: [192, 80, 77],
          textColor: 255,
        },
        styles: { 
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: 20, right: 20 },
      });
      
      // Service Popularity Section
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      const servicesY = doc.lastAutoTable.finalY + 15;
      doc.text('Service Popularity', 20, servicesY);
      
      // Sample service data
      const serviceData = [
        ['Hair Coloring', '68', '23%'],
        ['Haircut', '52', '18%'],
        ['Hair Treatment', '45', '15%'],
        ['Hair Styling', '42', '14%'],
        ['Facial', '38', '13%'],
        ['Manicure', '25', '9%'],
        ['Massage', '22', '8%'],
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Service', 'Count', 'Percentage']],
        body: serviceData,
        theme: 'grid',
        headStyles: { 
          fillColor: [155, 187, 89],
          textColor: 255,
        },
        styles: { 
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: 20, right: 20 },
      });
      
      // Add page number at the bottom
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: 'center' });
      }
      
      // Save and download the PDF
      doc.save(`salon-statistics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shop Statistics</h1>
        <button
          onClick={generatePdf}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Generating...' : 'Export as PDF'}
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Revenue Statistics</h2>
            <p>This is a placeholder for revenue statistics charts.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Customer Analytics</h2>
            <p>This is a placeholder for customer analytics charts.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Staff Performance</h2>
            <p>This is a placeholder for staff performance metrics.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Service Popularity</h2>
            <p>This is a placeholder for service popularity charts.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
