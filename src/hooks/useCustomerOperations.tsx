
// Temporary disabled hook to fix build errors
export const useCustomerOperations = () => {
  return {
    operations: [],
    isLoading: false,
    error: null,
    refetch: () => {}
  };
};
