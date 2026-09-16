import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/admin.functions";
import { useAuth } from "./use-auth";

export function useRoles() {
  const { user, loading } = useAuth();
  const fn = useServerFn(getMyRoles);
  const [roles, setRoles] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setRoles([]); setReady(true); return; }
    fn({}).then((r) => { setRoles(r); setReady(true); }).catch(() => setReady(true));
  }, [user, loading, fn]);

  const isMasterAdmin = (user?.email || "").toLowerCase().trim() === "emmaguscul@gmail.com";

  return {
    roles: isMasterAdmin && !roles.includes("admin") ? [...roles, "admin"] : roles,
    isAdmin: isMasterAdmin || roles.includes("admin"),
    isAffiliate: roles.includes("affiliate"),
    ready,
    user,
  };
}
