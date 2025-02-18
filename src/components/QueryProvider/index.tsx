"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
    children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
    // Criação correta do queryClient
    const  [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
