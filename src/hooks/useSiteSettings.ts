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

let cached: GeneralSettings | null = null;
let listeners: Array<(s: GeneralSettings) => void> = [];

const applyFavicon = (url: string | null) => {
  if (typeof document === "undefined") return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (url) link.href = url;
};

const applyTitle = (name: string) => {
  if (typeof document === "undefined") return;
  document.title = name;
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

    if (!cached) {
      fetchSettings().then((s) => {
        cached = s;
        applyFavicon(s.favicon_url);
        applyTitle(s.site_name);
        listeners.forEach((l) => l(s));
      });
    } else {
      applyFavicon(cached.favicon_url);
      applyTitle(cached.site_name);
    }

    return () => {
      mounted = false;
      listeners = listeners.filter((l) => l !== onUpdate);
    };
  }, []);

  return settings;
};
