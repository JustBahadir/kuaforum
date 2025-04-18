
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export interface ShopProfileHeaderProps {
  dukkanData: any;
  userRole: string | null;
  canEdit?: boolean;
  queryClient: any;
}

export function ShopProfileHeader({ dukkanData, userRole, queryClient, canEdit = false }: ShopProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ad: dukkanData?.ad || "",
    konum: dukkanData?.konum || ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("dukkanlar")
        .update({
          ad: formData.ad,
          konum: formData.konum
        })
        .eq("id", dukkanData.id);
      
      if (error) throw error;
      
      // Refresh shop data
      queryClient.invalidateQueries(["shopData", dukkanData.id]);
      
      toast.success("Dükkan bilgileri güncellendi");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAvatar = () => {
    const name = dukkanData?.ad || "Dükkan";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
          {dukkanData?.logo_url ? (
            <img 
              src={dukkanData.logo_url} 
              alt={dukkanData.ad} 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getDefaultAvatar()
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{dukkanData?.ad}</h1>
            {canEdit && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4 mr-1" /> Düzenle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Dükkan Bilgilerini Düzenle</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad">Dükkan Adı</Label>
                        <Input 
                          id="ad" 
                          name="ad" 
                          value={formData.ad} 
                          onChange={handleInputChange} 
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="konum">Konum/Şehir</Label>
                        <Input 
                          id="konum" 
                          name="konum" 
                          value={formData.konum} 
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">İptal</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Güncelleniyor..." : "Kaydet"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {dukkanData?.konum && (
            <p className="text-gray-500 mt-1">{dukkanData.konum}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Kuaför
            </span>
            {dukkanData?.aktif && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Aktif
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button>
            Randevu Yönetimi
          </Button>
        </div>
      </div>
    </div>
  );
}
