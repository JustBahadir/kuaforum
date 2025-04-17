
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { islemServisi, kategoriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Save, X, Search, AlertCircle } from "lucide-react";

interface ServiceCost {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet?: number;
  kategori_adi?: string;
  kategori_id?: number;
  profitMargin?: number;
}

export function ServiceCostManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedMaliyet, setEditedMaliyet] = useState<number>(0);
  
  const queryClient = useQueryClient();
  
  // Fetch services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await islemServisi.hepsiniGetir();
      return result.map((service: any) => ({
        ...service,
        maliyet: service.maliyet || 0,
        profitMargin: service.fiyat > 0 && service.maliyet ? 
          ((service.fiyat - service.maliyet) / service.fiyat) * 100 : null
      }));
    }
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => kategoriServisi.hepsiniGetir()
  });
  
  // Update service cost mutation
  const updateCostMutation = useMutation({
    mutationFn: async ({ id, maliyet }: { id: number, maliyet: number }) => {
      // Ensure we're passing a proper object with correct properties
      return await islemServisi.guncelle(id, { maliyet });
    },
    onSuccess: () => {
      toast.success("Maliyet başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Maliyet güncellenirken bir hata oluştu");
      console.error("Error updating cost:", error);
    }
  });
  
  // Start editing a service cost
  const handleEdit = (service: ServiceCost) => {
    setEditingId(service.id);
    setEditedMaliyet(service.maliyet || 0);
  };
  
  // Save the edited cost
  const handleSave = (id: number) => {
    updateCostMutation.mutate({ id, maliyet: editedMaliyet });
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
  };
  
  // Filter services based on search term and selected category
  const filteredServices = services.filter((service: ServiceCost) => {
    const matchesSearch = service.islem_adi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.kategori_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get profit margin color based on percentage
  const getProfitMarginColor = (margin: number | undefined) => {
    if (margin === undefined || margin === null) return "text-gray-500";
    if (margin < 0) return "text-red-600";
    if (margin < 20) return "text-orange-500";
    if (margin < 40) return "text-yellow-600";
    return "text-green-600";
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hizmet Maliyetleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-blue-500 h-5 w-5" />
              <p className="text-sm text-muted-foreground">
                Hizmetlerinizin maliyetlerini buradan güncelleyebilirsiniz. Kâr marjı otomatik olarak hesaplanacaktır.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hizmet ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.kategori_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingServices || isLoadingCategories ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Hizmet Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Fiyat</TableHead>
                    <TableHead className="text-right">Maliyet</TableHead>
                    <TableHead className="text-right">Kâr Marjı</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Hiçbir hizmet bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service: ServiceCost) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.islem_adi}</TableCell>
                        <TableCell>{service.kategori_adi || "Kategorisiz"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(service.fiyat)}</TableCell>
                        <TableCell className="text-right">
                          {editingId === service.id ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedMaliyet}
                              onChange={(e) => setEditedMaliyet(Number(e.target.value))}
                              className="w-24 text-right inline-block"
                            />
                          ) : (
                            formatCurrency(service.maliyet || 0)
                          )}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getProfitMarginColor(service.profitMargin)}`}>
                          {service.profitMargin !== null && service.profitMargin !== undefined
                            ? `%${service.profitMargin.toFixed(1)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === service.id ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSave(service.id)}
                                className="h-8 w-8"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancel}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(service)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
