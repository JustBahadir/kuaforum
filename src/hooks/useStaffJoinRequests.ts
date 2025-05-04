
// Temporary disabled hook to fix build errors
export const useStaffJoinRequests = () => {
  return {
    joinRequests: [],
    isLoading: false,
    error: null,
    refetch: () => {},
    approveRequest: async () => {},
    rejectRequest: async () => {}
  };
};
