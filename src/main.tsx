
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ui/theme-provider.tsx'
import { setupStorageBuckets } from './lib/supabase/setupStorage.ts'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500
    }
  }
})

// Setup storage buckets when app loads
setupStorageBuckets().then(success => {
  if (success) {
    console.log("Storage buckets setup completed");
  } else {
    console.warn("Storage buckets setup had issues");
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
