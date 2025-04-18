
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Image, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface ShopProfileHeaderProps {
  dukkanData: any;
  userRole: string | null;
  canEdit: boolean;
  queryClient?: any;
}

export function ShopProfileHeader({ dukkanData, userRole, canEdit, queryClient }: ShopProfileHeaderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ad: dukkanData?.ad || '',
    kod: dukkanData?.kod || '',
    telefon: dukkanData?.telefon || '',
    adres: dukkanData?.adres || '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('dukkanlar')
        .update(formData)
        .eq('id', dukkanData.id);
      
      if (error) throw error;
      
      toast({
        title: "Başarılı",
        description: "Dükkan bilgileri güncellendi.",
      });
      
      // Invalidate and refetch
      if (queryClient) {
        queryClient.invalidateQueries(['shopData', dukkanData.id]);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating shop data:", error);
      toast({
        title: "Hata",
        description: "Dükkan bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Check file size and type
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
          variant: "destructive",
        });
        return;
      }
      
      // Upload to storage
      const fileName = `logo_${dukkanData.id}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('shop_logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('shop_logos')
        .getPublicUrl(data.path);
      
      // Update dukkan record with new logo URL
      const { error: updateError } = await supabase
        .from('dukkanlar')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', dukkanData.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Başarılı",
        description: "Logo güncellendi.",
      });
      
      // Invalidate and refetch
      if (queryClient) {
        queryClient.invalidateQueries(['shopData', dukkanData.id]);
      }
      
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Hata",
        description: "Logo yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // Generate initials from shop name for avatar fallback
  const getInitials = () => {
    return dukkanData?.ad
      ?.split(' ')
      ?.map((name: string) => name[0])
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase() || 'KS';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 p-6 relative">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={dukkanData?.logo_url} alt={dukkanData?.ad} />
            <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          {canEdit && (
            <label 
              htmlFor="logo-upload"
              className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-1 text-white cursor-pointer"
            >
              <Image size={14} />
              <input 
                id="logo-upload" 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleAvatarUpload}
              />
            </label>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{dukkanData?.ad}</h1>
          <p className="text-muted-foreground">{dukkanData?.kod ? `#${dukkanData.kod}` : 'Kuaför'}</p>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" /> Düzenle
            </Button>
          )}
          <Button 
            onClick={() => navigate("/appointments")}
          >
            Randevu Yönetimi
          </Button>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dükkan Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Dükkan Adı</Label>
              <Input 
                id="shop-name"
                name="ad"
                value={formData.ad}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shop-code">Dükkan Kodu</Label>
              <Input 
                id="shop-code"
                name="kod"
                value={formData.kod}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shop-phone">Telefon</Label>
              <Input 
                id="shop-phone"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shop-address">Adres</Label>
              <Input 
                id="shop-address"
                name="adres"
                value={formData.adres}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>İptal</Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
