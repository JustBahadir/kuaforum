
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing on the server or until mounted on client
    // Avoids hydration mismatch error with next-themes that uses context
    return null;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
