import { supabase } from "../client";

const hepsiniGetir = async () => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*");

    if (error) {
      console.error("İşlemler getirilirken hata:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("İşlemler alınırken hata:", error);
    return [];
  }
};

const getir = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("İşlem getirilirken hata:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("İşlem alınırken hata:", error);
    return null;
  }
};

const ekle = async (data: any) => {
  try {
    const { data: islem, error } = await supabase
      .from("personel_islemleri")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("İşlem eklenirken hata:", error);
      return false;
    }

    return islem;
  } catch (error) {
    console.error("İşlem eklenirken hata:", error);
    return false;
  }
};

const guncelle = async (id: number, data: any) => {
  try {
    const { data: islem, error } = await supabase
      .from("personel_islemleri")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("İşlem güncellenirken hata:", error);
      return false;
    }

    return islem;
  } catch (error) {
    console.error("İşlem güncellenirken hata:", error);
    return false;
  }
};

const sil = async (id: number) => {
  try {
    const { error } = await supabase
      .from("personel_islemleri")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("İşlem silinirken hata:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("İşlem silinirken hata:", error);
    return false;
  }
};

const personelRapor = async (personelId: number, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*")
      .eq("personel_id", personelId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error("Personel raporu alınırken hata:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Personel raporu alınırken hata:", error);
    return [];
  }
};

const musteriRapor = async (musteriId: number, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*")
      .eq("musteri_id", musteriId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error("Müşteri raporu alınırken hata:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Müşteri raporu alınırken hata:", error);
    return [];
  }
};

const genelRapor = async (startDate: string, endDate: string, dukkanId: number) => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .eq("dukkan_id", dukkanId);

    if (error) {
      console.error("İşlem raporu alınırken hata:", error);
      return {
        totalServices: 0,
        totalAmount: 0,
        averageRating: 0,
        serviceCounts: [],
      };
    }

    const totalServices = data?.length || 0;
    const totalAmount = data?.reduce((acc, curr) => acc + curr.tutar, 0) || 0;
    const totalRating = data?.reduce((acc, curr) => acc + curr.puan, 0) || 0;
    const averageRating = totalServices > 0 ? totalRating / totalServices : 0;

    const services = data;
    const serviceCounts = services ? services.map(service => {
      return {
        id: service.id,
        dukkan_id: service.dukkan_id
      };
    }) : [];

    return {
      totalServices,
      totalAmount,
      averageRating,
      serviceCounts,
    };
  } catch (error) {
    console.error("İşlem raporu alınırken hata:", error);
    return {
      totalServices: 0,
      totalAmount: 0,
      averageRating: 0,
      serviceCounts: [],
    };
  }
};

const personelPerformansRaporu = async (personelId: number, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from("personel_islemleri")
      .select("*")
      .eq("personel_id", personelId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error("Personel performans raporu alınırken hata:", error);
      return {
        totalServices: 0,
        totalAmount: 0,
        averageRating: 0,
        serviceCounts: [],
      };
    }

    const totalServices = data?.length || 0;
    const totalAmount = data?.reduce((acc, curr) => acc + curr.tutar, 0) || 0;
    const totalRating = data?.reduce((acc, curr) => acc + curr.puan, 0) || 0;
    const averageRating = totalServices > 0 ? totalRating / totalServices : 0;

    const services = data;
    const serviceCounts = services ? services.map(service => {
      return {
        id: service.id,
        dukkan_id: service.dukkan_id || 0
      };
    }) : [];

    return {
      totalServices,
      totalAmount,
      averageRating,
      serviceCounts,
    };
  } catch (error) {
    console.error("Personel performans raporu alınırken hata:", error);
    return {
      totalServices: 0,
      totalAmount: 0,
      averageRating: 0,
      serviceCounts: [],
    };
  }
};

export const personelIslemleriServisi = {
  hepsiniGetir,
  getir,
  ekle,
  guncelle,
  sil,
  personelRapor,
  musteriRapor,
  genelRapor,
  personelPerformansRaporu,
};
