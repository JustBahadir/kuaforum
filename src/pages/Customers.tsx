
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BabyIcon,
  CalendarIcon,
  PhoneIcon,
  PlusCircle,
  Search,
  UserIcon,
  Users2,
} from "lucide-react";
import CustomerDetails from "./Customers/components/CustomerDetails";
import { musteriServisi, isletmeServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function Customers() {
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<Musteri[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Musteri | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [currentIsletmeId, setCurrentIsletmeId] = useState<string>("");
  
  // Form state
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    dogum_tarihi: ""
  });

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        
        // Get current user's business ID
        const isletmeId = await isletmeServisi.getCurrentUserIsletmeId();
        
        if (isletmeId) {
          setCurrentIsletmeId(isletmeId);
          
          // Get customers for this business
          const musteriler = await musteriServisi.isletmeyeGoreGetir(isletmeId);
          setCustomers(musteriler);
        }
      } catch (error) {
        console.error("Müşteriler yüklenirken hata:", error);
        toast.error("Müşteri listesi yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, []);

  // Format date from ISO string to local date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: tr });
    } catch (error) {
      return dateStr; // Return as is in case of error
    }
  };

  // Filter customers based on search term
  const filteredCustomers = searchTerm
    ? customers.filter(
        (customer) =>
          (customer.ad + " " + customer.soyad)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.telefon?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  // Handle input changes in form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create new customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ad || !currentIsletmeId) {
      toast.error("Ad alanı zorunludur");
      return;
    }
    
    try {
      const newCustomer = await musteriServisi.olustur({
        ad: formData.ad,
        soyad: formData.soyad || null,
        telefon: formData.telefon || null,
        dogum_tarihi: formData.dogum_tarihi || null,
        isletme_kimlik: currentIsletmeId
      });
      
      if (newCustomer) {
        toast.success("Müşteri başarıyla oluşturuldu");
        setFormData({
          ad: "",
          soyad: "",
          telefon: "",
          dogum_tarihi: ""
        });
        setCreateDialogOpen(false);
        
        // Update customer list
        setCustomers(prev => [...prev, newCustomer]);
      } else {
        toast.error("Müşteri oluşturulamadı");
      }
    } catch (error) {
      console.error("Müşteri oluşturulurken hata:", error);
      toast.error("Müşteri oluşturulurken bir hata oluştu");
    }
  };

  // Select a customer to view details
  const handleSelectCustomer = (customer: Musteri) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Left sidebar: Customer list */}
      <Card className="md:w-1/3 flex flex-col overflow-hidden h-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Users2 className="mr-2" /> Müşteriler
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Müşteri
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCustomer}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ad">Ad</Label>
                      <Input
                        id="ad"
                        name="ad"
                        value={formData.ad}
                        onChange={handleInputChange}
                        placeholder="Müşteri adı"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="soyad">Soyad</Label>
                      <Input
                        id="soyad"
                        name="soyad"
                        value={formData.soyad}
                        onChange={handleInputChange}
                        placeholder="Müşteri soyadı"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        name="telefon"
                        value={formData.telefon}
                        onChange={handleInputChange}
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dogum_tarihi">Doğum Tarihi</Label>
                      <Input
                        id="dogum_tarihi"
                        name="dogum_tarihi"
                        type="date"
                        value={formData.dogum_tarihi}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Müşteri Ekle</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Toplam {customers.length} müşteri kaydı bulunuyor
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm
                ? "Arama kriterlerine uygun müşteri bulunamadı"
                : "Henüz müşteri kaydı bulunmuyor"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.kimlik}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedCustomer?.kimlik === customer.kimlik
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex gap-2 items-center">
                    <UserIcon className="h-4 w-4" />
                    <p className="font-medium">
                      {customer.ad} {customer.soyad}
                    </p>
                  </div>
                  <div className="mt-1 text-xs flex flex-wrap gap-x-3 gap-y-1">
                    {customer.telefon && (
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" /> {customer.telefon}
                      </span>
                    )}
                    {customer.dogum_tarihi && (
                      <span className="flex items-center gap-1">
                        <BabyIcon className="h-3 w-3" /> {formatDate(customer.dogum_tarihi)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> {formatDate(customer.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right content: Customer details or placeholder */}
      <div className="md:w-2/3">
        {selectedCustomer ? (
          <CustomerDetails musteriId={selectedCustomer.kimlik} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center pt-6">
              <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Müşteri Detayları</p>
              <p className="text-sm text-muted-foreground mt-1">
                Detayları görmek için listeden bir müşteri seçin
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
