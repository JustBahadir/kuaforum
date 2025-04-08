
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { PersonnelDetailsAnalyst } from "./PersonnelDetailsAnalyst";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface PersonnelPerformanceReportsProps {
  personnelId?: number;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | undefined>(personnelId);
  
  // Get all personnel for selection dropdown
  const { data: allPersonnel = [], isLoading: isLoadingPersonnelList } = useQuery({
    queryKey: ['personnel-list'],
    queryFn: async () => {
      return personelServisi.hepsiniGetir();
    }
  });
  
  // Update selected personnel when prop changes
  useEffect(() => {
    if (personnelId) {
      setSelectedPersonnelId(personnelId);
    } else if (allPersonnel.length > 0 && !selectedPersonnelId) {
      setSelectedPersonnelId(allPersonnel[0].id);
    }
  }, [personnelId, allPersonnel, selectedPersonnelId]);
  
  // Get personnel details
  const { data: personnel, isLoading: isPersonnelLoading } = useQuery({
    queryKey: ['personnel', selectedPersonnelId],
    queryFn: async () => {
      if (!selectedPersonnelId) return null;
      return personelServisi.getirById(selectedPersonnelId);
    },
    enabled: !!selectedPersonnelId
  });

  // Get personnel operations
  const { data: operations = [], isLoading: isOperationsLoading } = useQuery({
    queryKey: ['personnelOperations', selectedPersonnelId],
    queryFn: async () => {
      if (!selectedPersonnelId) return [];
      return personelIslemleriServisi.personelIslemleriGetir(selectedPersonnelId);
    },
    enabled: !!selectedPersonnelId
  });

  // Generate weekly data
  const weeklyData = () => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const data = days.map(day => ({
      name: day,
      gelir: 0,
      islemSayisi: 0
    }));

    operations.forEach(op => {
      if (!op.created_at) return;
      const date = new Date(op.created_at);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
      const dayIndex = day === 0 ? 6 : day - 1; // Adjust to 0 = Monday, ..., 6 = Sunday

      data[dayIndex].gelir += op.tutar || 0;
      data[dayIndex].islemSayisi += 1;
    });

    return data;
  };

  // Generate monthly data
  const monthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      return {
        name: new Date(0, i).toLocaleDateString('tr-TR', { month: 'short' }),
        gelir: 0,
        islemSayisi: 0
      };
    });

    operations.forEach(op => {
      if (!op.created_at) return;
      const date = new Date(op.created_at);
      const monthIndex = date.getMonth();

      months[monthIndex].gelir += op.tutar || 0;
      months[monthIndex].islemSayisi += 1;
    });

    return months;
  };

  const isLoading = isPersonnelLoading || isOperationsLoading || isLoadingPersonnelList;
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePersonnelChange = (value: string) => {
    setSelectedPersonnelId(Number(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Personel Performans Raporu</h2>
        
        <Select
          value={selectedPersonnelId?.toString()}
          onValueChange={handlePersonnelChange}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Personel seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allPersonnel.map((person) => (
                <SelectItem key={person.id} value={person.id.toString()}>
                  {person.ad_soyad}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {personnel ? (
        <>
          {/* Add Analyst Component at the top */}
          <PersonnelDetailsAnalyst personnelId={selectedPersonnelId} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Performans - {personnel.ad_soyad}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData()}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'gelir') return formatCurrency(value as number);
                      return value;
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="gelir" name="Gelir (₺)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="islemSayisi" name="İşlem Sayısı" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aylık Performans - {personnel.ad_soyad}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData()}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'gelir') return formatCurrency(value as number);
                      return value;
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="gelir" name="Gelir (₺)" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="islemSayisi" name="İşlem Sayısı" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Lütfen personel seçiniz veya veri bulunamadı.
        </div>
      )}
    </div>
  );
}
