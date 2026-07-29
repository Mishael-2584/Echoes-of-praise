import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

type AdminUser = { id: string; email: string };

type AdminAuthValue = {
  user: AdminUser | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const DEMO_KEY = "eop_admin_demo";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const demoMode = !isSupabaseConfigured;

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        const demo = localStorage.getItem(DEMO_KEY);
        if (demo && mounted) {
          setUser({ id: "demo", email: demo });
        }
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (mounted && data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || "",
        });
      }
      if (mounted) setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(
          session?.user
            ? { id: session.user.id, email: session.user.email || "" }
            : null,
        );
      });
      return () => sub.subscription.unsubscribe();
    }

    const cleanup = init();
    return () => {
      mounted = false;
      void cleanup.then((unsub) => unsub?.());
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        const expected = import.meta.env.VITE_ADMIN_DEMO_PASSWORD || "echoes-admin";
        if (password !== expected) {
          throw new Error("Wrong demo password. Default: echoes-admin");
        }
        localStorage.setItem(DEMO_KEY, email || "admin@echoesofpraize.com");
        setUser({ id: "demo", email: email || "admin@echoesofpraize.com" });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        const msg = error.message || "Sign-in failed";
        if (/fetch|network|failed to fetch/i.test(msg)) {
          throw new Error(
            "Could not reach Supabase (network/CSP). Confirm VITE_SUPABASE_URL is set and the site was redeployed after CSP updates.",
          );
        }
        throw new Error(msg);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      localStorage.removeItem(DEMO_KEY);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, demoMode, signIn, signOut }),
    [user, loading, demoMode, signIn, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
