"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string>("");

  // ページビュー記録
  useEffect(() => {
    if (pathname && pathname !== lastRecordedPath.current) {
      lastRecordedPath.current = pathname;
      void getSupabase()
        .from("page_views")
        .insert({ path: pathname });
    }
  }, [pathname]);

  return <>{children}</>;
}
