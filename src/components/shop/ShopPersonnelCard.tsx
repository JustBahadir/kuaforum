
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface ShopPersonnelCardProps {
  personelListesi: any[];
  userRole: string;
}

export function ShopPersonnelCard({ personelListesi, userRole }: ShopPersonnelCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleShowImagePreview = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };
  
  const handleCloseImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Uzman Personeller</CardTitle>
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = "/personnel"}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Personel Yönetimi
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {personelListesi.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Henüz personel bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personelListesi.map((personel: any) => (
              <div key={personel.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <Avatar 
                  className="h-12 w-12 cursor-pointer" 
                  onClick={(e) => personel.avatar_url && handleShowImagePreview(personel.avatar_url, e)}
                >
                  {personel.avatar_url ? (
                    <AvatarImage 
                      src={personel.avatar_url} 
                      alt={personel.ad_soyad} 
                    />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {personel.ad_soyad.split(' ').map((name: string) => name[0]).join('').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">{personel.ad_soyad}</h3>
                  <p className="text-sm text-gray-500">{personel.unvan || "Personel"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={handleCloseImagePreview}>
          <DialogContent className="sm:max-w-md flex items-center justify-center" aria-describedby="dialog-description">
            <div id="dialog-description" className="sr-only">Personel fotoğrafı önizleme</div>
            <div className="relative">
              <img 
                src={previewImage || ""} 
                alt="Personel fotoğrafı" 
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
