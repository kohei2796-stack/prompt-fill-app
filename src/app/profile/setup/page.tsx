"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileSetupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
