
import { supabase } from "@/lib/supabase/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { operationId, notes } = req.body;

    if (!operationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update the operation notes
    const { data, error } = await supabase
      .from("personel_islemleri")
      .update({ notlar: notes })
      .eq("id", operationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating operation notes:", error);
      return res.status(500).json({ message: "Notlar güncellenirken bir hata oluştu", error });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in update-operation-notes API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
