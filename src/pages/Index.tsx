import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard from "@/components/NewsCard";
import { mockNews } from "@/data/mockNews";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const featured = mockNews.find((n) => n.featured)!;
  const secondary = mockNews.filter((n) => !n.featured).slice(0, 2);
  const latest = mockNews.filter((n) => !n.featured).slice(3);
  const mostRead = [...mockNews].sort(() => 0.5 - Math.random()).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Ad banner placeholder */}
      <div className="bg-muted">
        <div className="container mx-auto px-4 py-2 text-center">
          <div className="inline-block rounded bg-border px-8 py-3 text-xs text-muted-foreground">
            ESPAÇO PUBLICITÁRIO
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Hero + Secondary */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <NewsCard article={featured} variant="hero" />
          </div>
          <div className="flex flex-col gap-4">
            {secondary.map((article) => (
              <NewsCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        </section>

        {/* Latest News + Sidebar */}
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
                  <div key={article.id} className="flex gap-3 items-start">
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
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
