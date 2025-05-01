
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { personelServisi } from "@/lib/supabase";
import { dukkanServisi } from "@/lib/supabase";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  
  const [dukkanKodu, setDukkanKodu] = useState("");
  const [dukkanKodGecerli, setDukkanKodGecerli] = useState<boolean | null>(null);
  const [dukkanBilgisi, setDukkanBilgisi] = useState<any>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const navigate = useNavigate();
  
  const enteredDukkanKodu = watch("dukkan_kod");
  
  useEffect(() => {
    if (enteredDukkanKodu && enteredDukkanKodu.length >= 5) {
      const checkDukkanKodu = async () => {
        setIsCheckingCode(true);
        try {
          const dukkanlar = await dukkanServisi.kodaGoreGetir(enteredDukkanKodu);
          
          if (dukkanlar && dukkanlar.length > 0) {
            setDukkanKodGecerli(true);
            setDukkanBilgisi(dukkanlar[0]);
          } else {
            setDukkanKodGecerli(false);
            setDukkanBilgisi(null);
          }
        } catch (error) {
          console.error("Dükkan kodu kontrolünde hata:", error);
          setDukkanKodGecerli(false);
          setDukkanBilgisi(null);
        } finally {
          setIsCheckingCode(false);
        }
      };
      
      checkDukkanKodu();
    } else {
      setDukkanKodGecerli(null);
      setDukkanBilgisi(null);
    }
  }, [enteredDukkanKodu]);
  
  const onSubmit = async (data: any) => {
    if (!dukkanBilgisi) {
      toast.error("Lütfen geçerli bir işletme kodu girin.");
      return;
    }
    
    try {
      // Set the dukkan_id from the validated dukkan code
      data.dukkan_id = dukkanBilgisi.id;
      
      const response = await personelServisi.register(data);
      
      if (response) {
        toast.success("Başarıyla kaydoldunuz! Yönetici onayı bekleyiniz.");
        reset();
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      toast.error(`Kayıt başarısız: ${error.message || "Bilinmeyen bir hata oluştu"}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dukkan_kod">İşletme Kodu</Label>
            <Input
              id="dukkan_kod"
              placeholder="İşletme kodunu girin"
              {...register("dukkan_kod", { required: "İşletme kodu zorunludur" })}
            />
            {errors.dukkan_kod && (
              <p className="text-sm text-red-500">{`${errors.dukkan_kod.message}`}</p>
            )}
            {isCheckingCode && <p className="text-sm text-muted-foreground">Kod kontrol ediliyor...</p>}
            {dukkanKodGecerli === false && !isCheckingCode && (
              <p className="text-sm text-red-500">Geçersiz işletme kodu</p>
            )}
            {dukkanKodGecerli === true && !isCheckingCode && (
              <p className="text-sm text-green-500">
                İşletme bulundu: {dukkanBilgisi?.ad}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ad_soyad">Ad Soyad</Label>
            <Input
              id="ad_soyad"
              placeholder="Adınız ve soyadınız"
              {...register("ad_soyad", { required: "Ad Soyad zorunludur" })}
            />
            {errors.ad_soyad && (
              <p className="text-sm text-red-500">{`${errors.ad_soyad.message}`}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              placeholder="Telefon numaranız"
              {...register("telefon", { required: "Telefon zorunludur" })}
            />
            {errors.telefon && (
              <p className="text-sm text-red-500">{`${errors.telefon.message}`}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="eposta">E-posta</Label>
            <Input
              id="eposta"
              type="email"
              placeholder="E-posta adresiniz"
              {...register("eposta", { required: "E-posta zorunludur" })}
            />
            {errors.eposta && (
              <p className="text-sm text-red-500">{`${errors.eposta.message}`}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adres">Adres</Label>
            <Textarea
              id="adres"
              placeholder="Adresiniz"
              {...register("adres", { required: "Adres zorunludur" })}
            />
            {errors.adres && (
              <p className="text-sm text-red-500">{`${errors.adres.message}`}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birth_date">Doğum Tarihi</Label>
            <Input
              id="birth_date"
              type="date"
              {...register("birth_date")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="personel_no">Personel Numarası</Label>
            <Input
              id="personel_no"
              placeholder="Personel numaranız"
              {...register("personel_no", { required: "Personel numarası zorunludur" })}
            />
            {errors.personel_no && (
              <p className="text-sm text-red-500">{`${errors.personel_no.message}`}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="calisma_sistemi">Çalışma Sistemi</Label>
            <Input
              id="calisma_sistemi"
              placeholder="Çalışma sisteminiz"
              {...register("calisma_sistemi", { required: "Çalışma sistemi zorunludur" })}
            />
            {errors.calisma_sistemi && (
              <p className="text-sm text-red-500">{`${errors.calisma_sistemi.message}`}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prim_yuzdesi">Prim Yüzdesi (%)</Label>
              <Input
                id="prim_yuzdesi"
                type="number"
                placeholder="20"
                {...register("prim_yuzdesi", { 
                  required: "Prim yüzdesi zorunludur",
                  min: {
                    value: 0,
                    message: "Prim yüzdesi 0'dan küçük olamaz"
                  },
                  max: {
                    value: 100,
                    message: "Prim yüzdesi 100'den büyük olamaz"
                  }
                })}
              />
              {errors.prim_yuzdesi && (
                <p className="text-sm text-red-500">{`${errors.prim_yuzdesi.message}`}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maas">Maaş (₺)</Label>
              <Input
                id="maas"
                type="number"
                placeholder="5000"
                {...register("maas", { 
                  required: "Maaş zorunludur",
                  min: {
                    value: 0,
                    message: "Maaş 0'dan küçük olamaz"
                  }
                })}
              />
              {errors.maas && (
                <p className="text-sm text-red-500">{`${errors.maas.message}`}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN (Opsiyonel)</Label>
            <Input
              id="iban"
              placeholder="IBAN numaranız"
              {...register("iban")}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isCheckingCode || dukkanKodGecerli === false}
          >
            {isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
