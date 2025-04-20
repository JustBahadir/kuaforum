
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StaffJoinRequest {
  id: number;
  personel_id: number;
  dukkan_id: number;
  durum: string; // pending, accepted, rejected
  created_at: string;
  updated_at: string;
}

export function useStaffJoinRequests() {
  const queryClient = useQueryClient();

  const fetchRequests = async (): Promise<StaffJoinRequest[]> => {
    const { data, error } = await supabase
      .from<StaffJoinRequest, StaffJoinRequest>("staff_join_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff_join_requests"],
    queryFn: fetchRequests,
  });

  const mutateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "accepted" | "rejected";
    }) => {
      const { error } = await supabase
        .from("staff_join_requests")
        .update({ durum: status })
        .eq("id", id);

      if (error) throw error;

      // Optionally, if accepted, assign the personel to the dukkan? (Not automatic here)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_join_requests"] });
    },
  });

  const addRequest = useMutation({
    mutationFn: async ({
      personel_id,
      dukkan_id,
    }: {
      personel_id: number;
      dukkan_id: number;
    }) => {
      const { data, error } = await supabase
        .from("staff_join_requests")
        .insert([{ personel_id, dukkan_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_join_requests"] });
    },
  });

  return { data, isLoading, isError, mutateStatus, addRequest };
}
