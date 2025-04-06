
import { supabase } from "@/lib/supabase/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { islemId, personelId, customerId, tutar, puan, notlar } = req.body;

    if (!islemId || !personelId || !customerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get the service information
    const { data: islemData } = await supabase
      .from("islemler")
      .select("islem_adi, fiyat, puan")
      .eq("id", islemId)
      .single();

    if (!islemData) {
      return res.status(400).json({ message: "İşlem bulunamadı" });
    }

    // Calculate commission percentage based on personnel info
    const { data: personelData } = await supabase
      .from("personel")
      .select("prim_yuzdesi")
      .eq("id", personelId)
      .single();

    if (!personelData) {
      return res.status(400).json({ message: "Personel bulunamadı" });
    }

    // Calculate commission
    const primYuzdesi = personelData.prim_yuzdesi || 0;
    const odenen = (tutar * primYuzdesi) / 100;

    // Insert the operation record
    const { data, error } = await supabase
      .from("personel_islemleri")
      .insert([
        {
          personel_id: personelId,
          musteri_id: customerId,
          islem_id: islemId,
          tutar: tutar,
          puan: puan,
          prim_yuzdesi: primYuzdesi,
          odenen: odenen,
          aciklama: islemData.islem_adi,
          notlar: notlar || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding operation:", error);
      return res.status(500).json({ message: "İşlem eklenirken bir hata oluştu", error });
    }

    // Update shop statistics
    await supabase.rpc("update_shop_statistics");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in add-operation API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
