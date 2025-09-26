// src/lib/supabase-server.ts
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = async () => {
  const cookieStore = await cookies(); // 👈 await here
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        storage: {
          getItem: (key) => cookieStore.get(key)?.value ?? null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    }
  );
};
