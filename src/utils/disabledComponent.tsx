
import React from 'react';

/**
 * Devre dışı bırakılmış bileşenler için yardımcı fonksiyon
 */
export const createDisabledComponent = (name: string) => {
  const Component: React.FC = () => (
    <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
      <p className="text-gray-500">"{name}" bileşeni şu anda devre dışı.</p>
    </div>
  );
  
  Component.displayName = `DevredisiComponent_${name}`;
  return Component;
};

/**
 * Devre dışı hook oluşturmak için yardımcı fonksiyon
 */
export const createDisabledHook = (name: string) => () => {
  console.warn(`Hook "${name}" şu anda devre dışı ve varsayılan değerler döndürüyor.`);
  
  return {
    data: [],
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
    mutate: () => Promise.resolve(),
    isSuccess: false,
    isError: false,
  };
};
