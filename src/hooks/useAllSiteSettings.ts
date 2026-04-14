import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GeneralSettings {
  site_name: string;
  site_subtitle: string;
  logo_url: string | null;
  favicon_url: string | null;
}

interface SocialSettings {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  whatsapp: string;
}

interface FooterSettings {
  about_text: string;
  show_categories: boolean;
  show_social: boolean;
}

export interface AllSiteSettings {
  general: GeneralSettings;
  social: SocialSettings;
  footer: FooterSettings;
}

const DEFAULTS: AllSiteSettings = {
  general: {
    site_name: "O CATARINÃO",
    site_subtitle: "Notícias de Santa Catarina",
    logo_url: null,
    favicon_url: null,
  },
  social: { facebook: "", instagram: "", youtube: "", twitter: "", whatsapp: "" },
  footer: { about_text: "", show_categories: true, show_social: true },
};

const STORAGE_KEY = "all_site_settings";

let cached: AllSiteSettings | null = null;
let listeners: Array<(s: AllSiteSettings) => void> = [];

function getInitial(): AllSiteSettings {
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AllSiteSettings;
      cached = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULTS;
}

function persist(s: AllSiteSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

async function fetchAll(): Promise<AllSiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["general", "social", "footer"]);

  if (error || !data) return DEFAULTS;

  const result = { ...DEFAULTS };
  data.forEach((row) => {
    const key = row.key as keyof AllSiteSettings;
    if (key in result) {
      result[key] = { ...result[key], ...((row.value as any) ?? {}) };
    }
  });
  return result;
}

export const useAllSiteSettings = (): AllSiteSettings => {
  const [settings, setSettings] = useState<AllSiteSettings>(getInitial);

  useEffect(() => {
    let mounted = true;

    const onUpdate = (s: AllSiteSettings) => {
      if (mounted) setSettings(s);
    };
    listeners.push(onUpdate);

    if (cached) {
      setSettings(cached);
    }

    fetchAll().then((s) => {
      cached = s;
      persist(s);
      listeners.forEach((l) => l(s));
    });

    return () => {
      mounted = false;
      listeners = listeners.filter((l) => l !== onUpdate);
    };
  }, []);

  return settings;
};
