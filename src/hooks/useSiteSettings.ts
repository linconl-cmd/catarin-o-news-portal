import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GeneralSettings {
  site_name: string;
  site_subtitle: string;
  logo_url: string | null;
  favicon_url: string | null;
}

const DEFAULT_GENERAL: GeneralSettings = {
  site_name: "O CATARINÃO",
  site_subtitle: "JORNALISMO DE SANTA CATARINA",
  logo_url: null,
  favicon_url: null,
};

const STORAGE_KEY = "site_settings_general";

let cached: GeneralSettings | null = null;
let listeners: Array<(s: GeneralSettings) => void> = [];

// Try to restore from localStorage immediately (sync, before any render)
function getInitialSettings(): GeneralSettings {
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GeneralSettings;
      cached = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_GENERAL;
}

const applyFavicon = (url: string | null) => {
  if (typeof document === "undefined") return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (url) {
    link.href = url;
  }
};

const applyTitle = (name: string) => {
  if (typeof document === "undefined") return;
  const isAdmin =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");
  document.title = isAdmin ? `${name} - Admin` : name;
};

const persistToStorage = (s: GeneralSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore quota errors
  }
};

const fetchSettings = async (): Promise<GeneralSettings> => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("key", "general")
    .maybeSingle();

  if (error || !data) return DEFAULT_GENERAL;
  return { ...DEFAULT_GENERAL, ...((data.value as any) ?? {}) };
};

// Apply cached settings immediately on module load (before React renders)
const initial = getInitialSettings();
if (initial.favicon_url) {
  applyFavicon(initial.favicon_url);
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<GeneralSettings>(
    cached ?? DEFAULT_GENERAL
  );

  useEffect(() => {
    let mounted = true;

    const onUpdate = (s: GeneralSettings) => {
      if (mounted) setSettings(s);
    };
    listeners.push(onUpdate);

    // Apply cached values right away (in case module-level didn't fire yet)
    if (cached) {
      applyFavicon(cached.favicon_url);
      applyTitle(cached.site_name);
    }

    // Always fetch fresh data from Supabase to stay in sync
    fetchSettings().then((s) => {
      cached = s;
      persistToStorage(s);
      applyFavicon(s.favicon_url);
      applyTitle(s.site_name);
      listeners.forEach((l) => l(s));
    });

    return () => {
      mounted = false;
      listeners = listeners.filter((l) => l !== onUpdate);
    };
  }, []);

  return settings;
};
