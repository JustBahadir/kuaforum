
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StaffJoinRequest {
  id: number;
  personel_id: number | null;
  dukkan_id: number | null;
  durum: string; // pending, accepted, rejected
  created_at: string;
  updated_at: string;
}

export function useStaffJoinRequests() {
  const queryClient = useQueryClient();

  // Fetch function to retrieve join requests
  const fetchRequests = async (): Promise<StaffJoinRequest[]> => {
    const { data, error } = await supabase
      .from<StaffJoinRequest>("staff_join_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    return data;
  };

  // Added two generic arguments for useQuery (data type, error type)
  const { data, isLoading, isError } = useQuery<StaffJoinRequest[], Error>({
    queryKey: ["staff_join_requests"],
    queryFn: fetchRequests,
  });

  const mutateStatus = useMutation<
    void,
    Error,
    { id: number; status: "accepted" | "rejected" }
  >({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from("staff_join_requests")
        .update({ durum: status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_join_requests"] });
    },
  });

  const addRequest = useMutation<
    StaffJoinRequest,
    Error,
    { personel_id: number; dukkan_id: number }
  >({
    mutationFn: async ({ personel_id, dukkan_id }) => {
      const { data, error } = await supabase
        .from("staff_join_requests")
        .insert([{ personel_id, dukkan_id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_join_requests"] });
    },
  });

  return { data, isLoading, isError, mutateStatus, addRequest };
}
