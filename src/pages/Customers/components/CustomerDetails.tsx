
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerPersonalInfo } from "./CustomerPersonalInfo";
import { CustomerOperationsTable } from "./CustomerOperationsTable";
import { CustomerPreferences } from "./CustomerPreferences";
import { customerPersonalDataService } from "@/lib/supabase/services/customerPersonalDataService";
import { toast } from "sonner";
import { Musteri } from "@/lib/supabase/types";

interface CustomerDetailsProps {
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customer?: Musteri;
  onEdit?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  dukkanId?: number;
  isReadOnly?: boolean;
}

export function CustomerDetails({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  customer,
  onEdit,
  onDelete,
  dukkanId,
  isReadOnly = false
}: CustomerDetailsProps) {
  const queryClient = useQueryClient();
  const [spouseName, setSpouseName] = useState("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Fetch customer custom data (notes, children, etc.)
  const { data: customData, isLoading: isLoadingCustomData } = useQuery({
    queryKey: ["customer-custom-data", customerId],
    queryFn: () => customerPersonalDataService.getCustomerPersonalData(customerId),
    initialData: {
      custom_notes: "",
      children_names: [],
      spouse_name: ""
    }
  });

  // Update state when data is loaded
  useEffect(() => {
    if (customData) {
      setCustomNotes(customData.custom_notes || "");
      setChildrenNames(customData.children_names || []);
      setSpouseName(customData.spouse_name || "");
    }
  }, [customData]);

  // Update customer personal data mutation
  const updateCustomDataMutation = useMutation({
    mutationFn: (data: any) => 
      customerPersonalDataService.updateCustomerPersonalData(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-custom-data", customerId] });
      toast.success("Müşteri bilgileri güncellendi");
    },
    onError: (error) => {
      console.error("Müşteri bilgisi güncellenemedi:", error);
      toast.error("Müşteri bilgileri güncellenirken bir hata oluştu");
    }
  });

  // Save customer notes
  const saveCustomNotes = () => {
    updateCustomDataMutation.mutate({
      custom_notes: customNotes
    });
  };

  // Add child name
  const addChildName = () => {
    if (!newChildName.trim()) return;
    
    const updatedNames = [...childrenNames, newChildName.trim()];
    setChildrenNames(updatedNames);
    setNewChildName("");
    
    updateCustomDataMutation.mutate({
      children_names: updatedNames
    });
  };

  // Update spouse name
  const updateSpouseName = () => {
    updateCustomDataMutation.mutate({
      spouse_name: spouseName
    });
  };

  // Remove child name
  const removeChildName = (index: number) => {
    const updatedNames = childrenNames.filter((_, i) => i !== index);
    setChildrenNames(updatedNames);
    
    updateCustomDataMutation.mutate({
      children_names: updatedNames
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="info">Kişisel Bilgiler</TabsTrigger>
          <TabsTrigger value="history">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="preferences">Notlar ve Tercihler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <CustomerPersonalInfo
            customerId={customerId.toString()}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <CustomerOperationsTable customerId={customerId.toString()} />
        </TabsContent>
        
        <TabsContent value="preferences">
          <div>
            {/* Eşinin Adı */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Eşinin Adı</h3>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Eşinin adı"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                />
                <Button onClick={updateSpouseName}>Kaydet</Button>
              </div>
            </div>

            {/* Çocukların İsimleri */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Çocukların İsimleri</h3>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Çocuk adı"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addChildName()}
                />
                <Button onClick={addChildName}>Ekle</Button>
              </div>
              
              {childrenNames.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {childrenNames.map((name, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                    >
                      <span>{name}</span>
                      <button
                        onClick={() => removeChildName(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Henüz çocuk bilgisi eklenmemiş.</p>
              )}
            </div>
            
            {/* Özel Notlar */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Özel Notlar</h3>
              <div className="space-y-2">
                <textarea
                  className="w-full min-h-[100px] border rounded-md p-2"
                  placeholder="Müşteri hakkında notlar..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
                <Button onClick={saveCustomNotes}>Kaydet</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
