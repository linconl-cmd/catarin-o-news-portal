import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

const META_ROW_ID = "00000000-0000-0000-0000-000000000001";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { data } = await supabase
    .from("site_meta_settings")
    .select("og_title, og_description, og_image_url, og_url, twitter_card")
    .eq("id", META_ROW_ID)
    .single();

  const title = escapeHtml(data?.og_title || "O Catarinão - Notícias de Santa Catarina");
  const description = escapeHtml(data?.og_description || "Portal de notícias de Santa Catarina.");
  const image = escapeHtml(data?.og_image_url || "");
  const url = escapeHtml(data?.og_url || "https://ocatarinao.vercel.app");
  const twitterCard = escapeHtml(data?.twitter_card || "summary_large_image");

  const requestPath = (req.url || "/").replace(/^\/api\/og/, "") || "/";
  const canonicalUrl = url.replace(/\/$/, "") + requestPath;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="O Catarinão" />

  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="O Catarinão" />

  <meta name="twitter:card" content="${twitterCard}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).send(html);
}
