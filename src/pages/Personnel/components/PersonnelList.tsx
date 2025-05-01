
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PersonnelActionMenu } from "./PersonnelActionMenu";
import { PersonnelDetail } from "./PersonnelDetail";
import { formatCurrency } from "@/utils/currencyFormatter";

interface PersonnelListProps {
  personel: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onPersonnelSelect?: (personelId: number) => void;
}

export function PersonnelList({
  personel,
  isLoading,
  onRefresh,
  onPersonnelSelect,
}: PersonnelListProps) {
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetails = (p: any) => {
    setSelectedPersonnel(p);
    setDetailOpen(true);
    if (onPersonnelSelect) {
      onPersonnelSelect(p.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (personel.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Henüz personel eklenmemiş</h3>
        <p className="text-gray-500 mt-2">
          "Yeni Personel" butonunu kullanarak personel ekleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {personel.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="flex justify-end p-2">
              <PersonnelActionMenu
                personel={p}
                onViewDetails={handleViewDetails}
                onRefresh={onRefresh}
              />
            </div>
            <CardContent className="p-4 pt-0">
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => handleViewDetails(p)}
              >
                <Avatar className="h-16 w-16">
                  {p.avatar_url ? (
                    <AvatarImage src={p.avatar_url} alt={p.ad_soyad} />
                  ) : (
                    <AvatarFallback>{getInitials(p.ad_soyad)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{p.ad_soyad}</h3>
                  <p className="text-muted-foreground text-sm">
                    {p.personel_no}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="text-sm">{p.telefon || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-posta</p>
                  <p className="text-sm truncate" title={p.eposta}>
                    {p.eposta || "-"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">İşlem</p>
                  <p className="text-sm">{p.islem_count || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ciro</p>
                  <p className="text-sm">
                    {p.total_revenue
                      ? formatCurrency(p.total_revenue)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPersonnel && (
        <PersonnelDetail
          personel={selectedPersonnel}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
