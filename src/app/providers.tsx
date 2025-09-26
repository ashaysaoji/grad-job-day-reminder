"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qc}>
      {/* Framer global defaults */}
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </MotionConfig>
    </QueryClientProvider>
  );
}
