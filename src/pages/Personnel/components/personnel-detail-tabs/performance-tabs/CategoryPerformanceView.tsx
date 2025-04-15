
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, islemServisi } from "@/lib/supabase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryPerformanceViewProps {
  personnel: any;
  dateRange: { from: Date; to: Date };
  refreshKey: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

export function CategoryPerformanceView({ personnel, dateRange, refreshKey }: CategoryPerformanceViewProps) {
  // Get all service categories
  const { data: services = [] } = useQuery({
    queryKey: ['services-for-categories'],
    queryFn: () => islemServisi.hepsiniGetir(),
  });

  // Get personnel operations
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnel-operations-categories', personnel.id, dateRange.from, dateRange.to, refreshKey],
    queryFn: async () => {
      if (!personnel?.id) return [];
      
      try {
        const operations = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
        
        return operations.filter(op => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        return [];
      }
    },
  });

  // Process category data for charts
  const categoryData = useMemo(() => {
    if (!operations?.length || !services?.length) return [];

    const categoryMap = new Map();
    
    operations.forEach(op => {
      if (!op.islem_id) return;
      
      const service = services.find(s => s.id === op.islem_id);
      if (!service || !service.kategori_id) return;
      
      // For demo purposes, use category IDs
      const kategoriId = service.kategori_id;
      const kategoriAdi = `Kategori ${kategoriId}`; 
      
      if (!categoryMap.has(kategoriAdi)) {
        categoryMap.set(kategoriAdi, {
          name: kategoriAdi,
          count: 0,
          revenue: 0
        });
      }
      
      const entry = categoryMap.get(kategoriAdi);
      entry.count += 1;
      entry.revenue += Number(op.tutar) || 0;
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);
  }, [operations, services]);

  // Calculate totals for the table
  const totals = useMemo(() => {
    if (!categoryData.length) return { count: 0, revenue: 0 };
    
    return categoryData.reduce(
      (sum, item) => ({ 
        count: sum.count + item.count, 
        revenue: sum.revenue + item.revenue
      }), 
      { count: 0, revenue: 0 }
    );
  }, [categoryData]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!categoryData.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">Seçilen tarih aralığında kategori verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Combined Bar + Line chart */}
      <div>
        <h4 className="text-sm font-medium mb-2">Kategori Bazlı Ciro ve İşlem Sayısı</h4>
        <div className="border rounded p-2 overflow-x-auto">
          <div style={{ width: '100%', height: 300, minWidth: `${categoryData.length * 100}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={categoryData}
                margin={{ top: 10, right: 30, left: 0, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  height={70}
                  tick={props => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="end" 
                          fill="#666" 
                          transform="rotate(-45)"
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "revenue") return [formatCurrency(value as number), "Ciro"];
                    return [value, "İşlem Sayısı"];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Ciro" fill="#8884d8" barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="İşlem Sayısı" stroke="#82ca9d" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Kategori Dağılımı</h4>
          <div className="border rounded p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, 'İşlem Sayısı']} 
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Ciro Dağılımı</h4>
          <div className="border rounded p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="revenue"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [formatCurrency(value as number), 'Ciro']} 
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Details Table */}
      <div>
        <h4 className="text-sm font-medium mb-2">Kategori Detayları</h4>
        <div className="border rounded overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem Sayısı</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ciro</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{category.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(category.revenue)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Toplam</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{totals.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(totals.revenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
