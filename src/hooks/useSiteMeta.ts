import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const META_ROW_ID = "00000000-0000-0000-0000-000000000001";

function setMetaTag(selector: string, attribute: string, value: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attribute, value);
  }
}

export function useSiteMeta() {
  useEffect(() => {
    const fetchMeta = async () => {
      const { data, error } = await supabase
        .from("site_meta_settings")
        .select("og_title, og_description, og_image_url, og_url, twitter_card")
        .eq("id", META_ROW_ID)
        .single();

      if (error || !data) return;

      // Update standard meta description
      setMetaTag('meta[name="description"]', "content", data.og_description);

      // Update Open Graph tags
      setMetaTag('meta[property="og:title"]', "content", data.og_title);
      setMetaTag('meta[property="og:description"]', "content", data.og_description);
      setMetaTag('meta[property="og:image"]', "content", data.og_image_url || "");
      setMetaTag('meta[property="og:url"]', "content", data.og_url);

      // Update Twitter Card tags
      setMetaTag('meta[name="twitter:card"]', "content", data.twitter_card);
      setMetaTag('meta[name="twitter:title"]', "content", data.og_title);
      setMetaTag('meta[name="twitter:description"]', "content", data.og_description);
      setMetaTag('meta[name="twitter:image"]', "content", data.og_image_url || "");
    };

    fetchMeta();
  }, []);
}
