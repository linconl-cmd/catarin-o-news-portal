import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdsSettings {
  enabled: boolean;
  header_banner_url: string | null;
  header_link: string;
  sidebar_banner_url: string | null;
  sidebar_link: string;
  inline_banner_url: string | null;
  inline_link: string;
}

const DEFAULT_ADS: AdsSettings = {
  enabled: false,
  header_banner_url: null,
  header_link: "",
  sidebar_banner_url: null,
  sidebar_link: "",
  inline_banner_url: null,
  inline_link: "",
};

let adsCache: AdsSettings | null = null;
let adsListeners: Array<(s: AdsSettings) => void> = [];

const fetchAds = async (): Promise<AdsSettings> => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ads")
    .maybeSingle();
  if (error || !data) return DEFAULT_ADS;
  return { ...DEFAULT_ADS, ...((data.value as any) ?? {}) };
};

export const useAdsSettings = () => {
  const [ads, setAds] = useState<AdsSettings>(adsCache ?? DEFAULT_ADS);

  useEffect(() => {
    let mounted = true;
    const onUpdate = (s: AdsSettings) => mounted && setAds(s);
    adsListeners.push(onUpdate);

    if (!adsCache) {
      fetchAds().then((s) => {
        adsCache = s;
        adsListeners.forEach((l) => l(s));
      });
    }

    return () => {
      mounted = false;
      adsListeners = adsListeners.filter((l) => l !== onUpdate);
    };
  }, []);

  return ads;
};

interface AdBannerProps {
  slot: "header" | "sidebar" | "inline";
  className?: string;
}

const AdBanner = ({ slot, className = "" }: AdBannerProps) => {
  const ads = useAdsSettings();

  if (!ads.enabled) return null;

  const url = ads[`${slot}_banner_url` as keyof AdsSettings] as string | null;
  const link = ads[`${slot}_link` as keyof AdsSettings] as string;

  // Fallback placeholder when enabled but no image uploaded
  if (!url) {
    return (
      <div className={`bg-muted ${className}`}>
        <div className="container mx-auto px-4 py-2 text-center">
          <div className="inline-block rounded bg-border px-8 py-3 text-xs text-muted-foreground">
            ESPAÇO PUBLICITÁRIO
          </div>
        </div>
      </div>
    );
  }

  const image = (
    <img
      src={url}
      alt="Publicidade"
      className="mx-auto max-h-[250px] w-auto object-contain"
      loading="lazy"
    />
  );

  return (
    <div className={`bg-muted ${className}`}>
      <div className="container mx-auto px-4 py-3 text-center">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label="Anúncio"
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>
  );
};

export default AdBanner;
