
import { supabase } from "@/lib/supabase/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { operationId, photoUrl } = req.body;

    if (!operationId || !photoUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get the current operation to check if it has existing photos
    const { data: currentOperation, error: fetchError } = await supabase
      .from("personel_islemleri")
      .select("photos")
      .eq("id", operationId)
      .single();

    if (fetchError) {
      console.error("Error fetching operation:", fetchError);
      return res.status(500).json({ message: "İşlem bilgisi alınırken bir hata oluştu", error: fetchError });
    }

    // Prepare the updated photos array
    const existingPhotos = currentOperation?.photos || [];
    
    // Check if we already have 2 photos
    if (existingPhotos.length >= 2) {
      return res.status(400).json({ message: "En fazla 2 fotoğraf eklenebilir" });
    }
    
    const updatedPhotos = [...existingPhotos, photoUrl];

    // Update the operation with the new photo
    const { data, error: updateError } = await supabase
      .from("personel_islemleri")
      .update({ photos: updatedPhotos })
      .eq("id", operationId)
      .select()
      .single();

    if (updateError) {
      console.error("Error adding operation photo:", updateError);
      return res.status(500).json({ message: "Fotoğraf eklenirken bir hata oluştu", error: updateError });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in add-operation-photo API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
