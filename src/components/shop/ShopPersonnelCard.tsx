
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ShopPersonnelCardProps {
  personelListesi: any[];
  userRole: string;
}

export function ShopPersonnelCard({ personelListesi, userRole }: ShopPersonnelCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleShowImagePreview = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };
  
  const handleCloseImagePreview = () => {
    setPreviewImage(null);
  };
  
  const handlePersonnelClick = (personelId: number) => {
    navigate(`/personnel/${personelId}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Uzman Personeller</CardTitle>
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/personnel")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {personelListesi.map((personel: any) => (
              <div 
                key={personel.id} 
                className="group flex flex-col items-center bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/personnel/${personel.id}`)}
              >
                <Avatar 
                  className="h-24 w-24 mb-4 transition-transform group-hover:scale-105" 
                  onClick={(e) => personel.avatar_url && handleShowImagePreview(personel.avatar_url, e)}
                >
                  {personel.avatar_url ? (
                    <AvatarImage 
                      src={personel.avatar_url} 
                      alt={personel.ad_soyad} 
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-3xl">
                      {personel.ad_soyad.split(' ').map((name: string) => name[0]).join('').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg group-hover:text-purple-600 transition-colors">
                    {personel.ad_soyad}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{personel.unvan || "Personel"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!previewImage} onOpenChange={handleCloseImagePreview}>
          <DialogContent className="sm:max-w-md flex items-center justify-center">
            <img 
              src={previewImage || ""} 
              alt="Personel fotoğrafı" 
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
