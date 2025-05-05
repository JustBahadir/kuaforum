
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { musteriServisi, isletmeServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Customers with full feature set - search, add, update

export default function Customers() {
  const [customers, setCustomers] = useState<Musteri[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Musteri[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    ad_soyad: "",
    telefon: "",
    dogum_tarihi: "",
    cinsiyet: "",
    adres: "",
    isletme_id: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCustomers(customers.filter((customer) => {
        const fullName = (customer.ad_soyad || `${customer.ad || ''} ${customer.soyad || ''}`).toLowerCase();
        const phone = (customer.telefon || "").toLowerCase();
        return fullName.includes(term) || phone.includes(term);
      }));
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Get current user's business
      const isletme = await isletmeServisi.kullaniciIsletmesiniGetir();
      
      if (!isletme) {
        toast.error("İşletme bilgileri alınamadı");
        setIsLoading(false);
        return;
      }
      
      // Update new customer form with shop ID
      setNewCustomer(prev => ({ ...prev, isletme_id: isletme.id }));
      
      // Get customers for this business
      const musteriler = await musteriServisi.isletmeyeGoreGetir(isletme.id);
      setCustomers(musteriler);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
      toast.error("Müşteriler alınamadı");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCustomer = async () => {
    if (!newCustomer.ad_soyad || !newCustomer.telefon) {
      toast.error("Ad Soyad ve Telefon alanları zorunludur");
      return;
    }
    
    try {
      await musteriServisi.ekle(newCustomer);
      
      toast.success("Yeni müşteri eklendi");
      setIsAddDialogOpen(false);
      setNewCustomer({
        ad_soyad: "",
        telefon: "",
        dogum_tarihi: "",
        cinsiyet: "",
        adres: "",
        isletme_id: newCustomer.isletme_id
      });
      
      fetchCustomers();
    } catch (error) {
      console.error("Müşteri eklenemedi:", error);
      toast.error("Müşteri eklenemedi");
    }
  };

  return (
    <div className="container p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Müşteri ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchCustomers()} variant="outline" className="w-full md:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Müşteri
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Müşteriler yükleniyor...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                {searchTerm ? "Aranan kriterlere uygun müşteri bulunamadı." : "Henüz müşteri bulunmuyor."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri Adı
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium">
                            {customer.ad_soyad || `${customer.ad || ''} ${customer.soyad || ''}`}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {customer.telefon || ''}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <Button variant="outline" size="sm" 
                            onClick={() => {
                              // Navigate to customer details
                              window.location.href = `/customers/${customer.id}`;
                            }}
                          >
                            Detaylar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad Soyad</label>
              <Input
                placeholder="Ad Soyad"
                value={newCustomer.ad_soyad}
                onChange={(e) => setNewCustomer({ ...newCustomer, ad_soyad: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                placeholder="05XX XXX XX XX"
                value={newCustomer.telefon}
                onChange={(e) => setNewCustomer({ ...newCustomer, telefon: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Doğum Tarihi</label>
              <Input
                type="date"
                value={newCustomer.dogum_tarihi}
                onChange={(e) => setNewCustomer({ ...newCustomer, dogum_tarihi: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cinsiyet</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newCustomer.cinsiyet}
                onChange={(e) => setNewCustomer({ ...newCustomer, cinsiyet: e.target.value })}
              >
                <option value="">Seçiniz</option>
                <option value="Kadın">Kadın</option>
                <option value="Erkek">Erkek</option>
                <option value="Belirtilmedi">Belirtmek İstemiyorum</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adres</label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[100px]"
                value={newCustomer.adres}
                onChange={(e) => setNewCustomer({ ...newCustomer, adres: e.target.value })}
                placeholder="Adres"
              ></textarea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddCustomer}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
