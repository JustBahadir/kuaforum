
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface ShopContactCardProps {
  dukkanData: any;
  canEdit?: boolean;
}

export function ShopContactCard({ dukkanData, canEdit = false }: ShopContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    telefon: dukkanData?.telefon || "",
    adres: dukkanData?.adres || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          telefon: formData.telefon,
          adres: formData.adres,
        })
        .eq("id", dukkanData.id);
      
      if (error) throw error;
      
      toast.success("İletişim bilgileri güncellendi");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} kopyalandı`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>İletişim Bilgileri</CardTitle>
        {canEdit && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Düzenle</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>İletişim Bilgilerini Düzenle</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adres">Adres</Label>
                    <Textarea
                      id="adres"
                      name="adres"
                      value={formData.adres}
                      onChange={handleInputChange}
                      placeholder="Dükkan adresini girin"
                      rows={3}
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
      </CardHeader>
      <CardContent className="space-y-4">
        {dukkanData?.adres ? (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-800">{dukkanData.adres}</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => copyToClipboard(dukkanData.adres, "Adres")}
              >
                <Copy className="h-3 w-3 mr-1" /> Kopyala
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <MapPin className="h-5 w-5" />
            <p className="text-sm">Adres bilgisi bulunamıyor</p>
          </div>
        )}

        {dukkanData?.telefon ? (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-800">{dukkanData.telefon}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 ml-auto"
              onClick={() => copyToClipboard(dukkanData.telefon, "Telefon")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <Phone className="h-5 w-5" />
            <p className="text-sm">Telefon bilgisi bulunamıyor</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
