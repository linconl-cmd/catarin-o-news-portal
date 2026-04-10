import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard, { type PublicArticle } from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import { TrendingUp, Loader2 } from "lucide-react";

const Index = () => {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, title, slug, summary, cover_image_url, published_at, is_featured, views_count, category_id, author_id, categories(name, slug, color)"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch author names
      const authorIds = [
        ...new Set(data.map((a: any) => a.author_id).filter(Boolean)),
      ];
      let profileMap = new Map<string, string>();

      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", authorIds as string[]);

        profileMap = new Map(
          (profiles ?? []).map((p) => [p.user_id, p.full_name ?? ""])
        );
      }

      const mapped: PublicArticle[] = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        summary: a.summary,
        cover_image_url: a.cover_image_url,
        published_at: a.published_at,
        is_featured: a.is_featured,
        views_count: a.views_count,
        category_name: a.categories?.name ?? null,
        category_slug: a.categories?.slug ?? null,
        category_color: a.categories?.color ?? null,
        author_name: a.author_id ? profileMap.get(a.author_id) ?? null : null,
      }));

      setArticles(mapped);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  const featured = articles.find((a) => a.is_featured) ?? articles[0];
  const secondary = articles
    .filter((a) => a.id !== featured?.id)
    .slice(0, 2);
  const latest = articles
    .filter(
      (a) => a.id !== featured?.id && !secondary.find((s) => s.id === a.id)
    );
  const mostRead = [...articles]
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Header ad banner (only renders when ads are enabled) */}
      <AdBanner slot="header" />

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Nenhuma notícia publicada ainda.
            </p>
          </div>
        ) : (
          <>
            {/* Hero + Secondary */}
            {featured && (
              <section className="grid gap-6 lg:grid-cols-3 lg:auto-rows-[1fr]">
                <div className="lg:col-span-2 rounded-lg border-2 border-primary overflow-hidden">
                  <NewsCard
                    article={featured}
                    variant="hero"
                    className="h-full"
                  />
                </div>
                <div className="flex flex-col gap-4 h-full">
                  {secondary.map((article) => (
                    <div key={article.id} className="flex-1">
                      <NewsCard
                        article={article}
                        variant="default"
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Latest News + Sidebar */}
            {latest.length > 0 && (
              <section className="mt-10 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h2 className="font-heading text-xl font-bold text-foreground border-b-2 border-accent pb-2 mb-6">
                    Últimas Notícias
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {latest.map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <aside>
                  <div className="rounded-lg bg-card p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground border-b-2 border-accent pb-2 mb-4">
                      <TrendingUp size={18} className="text-accent" />
                      Mais Lidas
                    </h3>
                    <div>
                      {mostRead.map((article, i) => (
                        <div
                          key={article.id}
                          className="flex gap-3 items-start"
                        >
                          <span className="flex-shrink-0 font-heading text-2xl font-black text-accent/40">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <NewsCard article={article} variant="compact" />
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </section>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
