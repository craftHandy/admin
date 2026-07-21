import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import queryClient from "@/lib/react-query";
import { env } from "@/env";

interface IAppProvider {
  children: React.ReactNode;
}

function AppProvider({ children }: IAppProvider) {
  useEffect(() => {
    if (env.prod) {
      console.log = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        duration={3000}
        richColors
        closeButton
      />
    </QueryClientProvider>
  );
}

export default AppProvider;
