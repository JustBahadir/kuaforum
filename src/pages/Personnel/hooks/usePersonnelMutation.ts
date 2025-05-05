
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Personel } from "@/types/personnel";

export function usePersonnelMutation() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Create new personnel
  const createPersonnel = async (personnelData: Omit<Personel, "id" | "created_at">): Promise<Personel | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("personel")
        .insert([personnelData])
        .select();
      
      if (error) {
        console.error("Personnel creation error:", error);
        toast.error("Personel eklenirken bir hata oluştu");
        return null;
      }

      toast.success("Personel başarıyla eklendi");
      return data[0] as Personel;
    } catch (error) {
      console.error("Personnel creation error:", error);
      toast.error("Personel eklenirken bir hata oluştu");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update personnel
  const updatePersonnel = async (id: string, personnelData: Partial<Personel>): Promise<Personel | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("personel")
        .update(personnelData)
        .eq("id", id)
        .select();
      
      if (error) {
        console.error("Personnel update error:", error);
        toast.error("Personel güncellenirken bir hata oluştu");
        return null;
      }

      toast.success("Personel başarıyla güncellendi");
      return data[0] as Personel;
    } catch (error) {
      console.error("Personnel update error:", error);
      toast.error("Personel güncellenirken bir hata oluştu");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete personnel
  const deletePersonnel = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("personel")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Personnel deletion error:", error);
        toast.error("Personel silinirken bir hata oluştu");
        return false;
      }

      toast.success("Personel başarıyla silindi");
      return true;
    } catch (error) {
      console.error("Personnel deletion error:", error);
      toast.error("Personel silinirken bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Accept staff join request
  const acceptStaffJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // First get the request details
      const { data: requestData, error: requestError } = await supabase
        .from("personel_katilim_istekleri")
        .select("*")
        .eq("id", requestId)
        .single();
      
      if (requestError) {
        console.error("Error fetching join request:", requestError);
        toast.error("Katılım isteği bilgileri alınamadı");
        return false;
      }
      
      // Create personnel record
      const personnelData = {
        dukkan_id: requestData.dukkan_id,
        ad_soyad: requestData.ad_soyad,
        eposta: requestData.eposta,
        telefon: requestData.telefon || "",
        personel_no: `P${new Date().getTime().toString().slice(-6)}`,
        maas: 0,
        prim_yuzdesi: 0,
        calisma_sistemi: "tam_zamanli",
        adres: "",
        kullanici_kimlik: requestData.kullanici_kimlik
      };
      
      const { error: personnelError } = await supabase
        .from("personel")
        .insert([personnelData]);
      
      if (personnelError) {
        console.error("Error creating personnel record:", personnelError);
        toast.error("Personel kaydı oluşturulamadı");
        return false;
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from("personel_katilim_istekleri")
        .update({ durum: "kabul_edildi" })
        .eq("id", requestId);
      
      if (updateError) {
        console.error("Error updating request status:", updateError);
        toast.error("İstek durumu güncellenemedi");
        return false;
      }
      
      toast.success("Personel katılım isteği kabul edildi");
      return true;
    } catch (error) {
      console.error("Error accepting staff join request:", error);
      toast.error("İstek işlenirken bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reject staff join request
  const rejectStaffJoinRequest = async (requestId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("personel_katilim_istekleri")
        .update({ durum: "reddedildi" })
        .eq("id", requestId);
      
      if (error) {
        console.error("Error rejecting join request:", error);
        toast.error("İstek reddedilemedi");
        return false;
      }
      
      toast.success("Personel katılım isteği reddedildi");
      return true;
    } catch (error) {
      console.error("Error rejecting staff join request:", error);
      toast.error("İstek işlenirken bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
    acceptStaffJoinRequest,
    rejectStaffJoinRequest
  };
}
