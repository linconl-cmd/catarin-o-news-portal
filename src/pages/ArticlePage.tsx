import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard, { type PublicArticle } from "@/components/NewsCard";
import { Loader2, Calendar, User, Eye, ArrowLeft } from "lucide-react";

interface FullArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  views_count: number;
  meta_title: string | null;
  meta_description: string | null;
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  author_name: string | null;
}

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [related, setRelated] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, title, slug, summary, content, cover_image_url, published_at, views_count, meta_title, meta_description, category_id, author_id, categories(name, slug, color)"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Increment views
      supabase.rpc("increment_article_views", { article_id: data.id });

      // Fetch author name
      let authorName: string | null = null;
      if (data.author_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", data.author_id)
          .single();
        authorName = profile?.full_name ?? null;
      }

      const cat = data.categories as any;

      setArticle({
        id: data.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        cover_image_url: data.cover_image_url,
        published_at: data.published_at,
        views_count: data.views_count,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        category_name: cat?.name ?? null,
        category_slug: cat?.slug ?? null,
        category_color: cat?.color ?? null,
        author_name: authorName,
      });

      // Update page title
      const storedName = (() => { try { const s = localStorage.getItem("site_settings_general"); return s ? JSON.parse(s).site_name : null; } catch { return null; } })();
      document.title = `${data.meta_title || data.title} | ${storedName || "O Catarinão"}`;

      // Fetch related articles (same category)
      if (data.category_id) {
        const { data: relatedData } = await supabase
          .from("articles")
          .select(
            "id, title, slug, summary, cover_image_url, published_at, is_featured, views_count, categories(name, slug, color)"
          )
          .eq("status", "published")
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(4);

        if (relatedData) {
          setRelated(
            relatedData.map((r: any) => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              summary: r.summary,
              cover_image_url: r.cover_image_url,
              published_at: r.published_at,
              is_featured: r.is_featured,
              views_count: r.views_count,
              category_name: r.categories?.name ?? null,
              category_slug: r.categories?.slug ?? null,
              category_color: r.categories?.color ?? null,
              author_name: null,
            }))
          );
        }
      }

      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notFound ? (
          <div className="py-20 text-center">
            <h2 className="font-heading text-2xl font-bold">
              Notícia não encontrada
            </h2>
            <p className="mt-2 text-muted-foreground">
              A notícia que você procura não existe ou foi removida.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>
          </div>
        ) : article ? (
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              {article.category_name && (
                <>
                  <Link
                    to={`/categoria/${article.category_slug}`}
                    className="hover:text-foreground"
                    style={{ color: article.category_color ?? undefined }}
                  >
                    {article.category_name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground line-clamp-1">
                {article.title}
              </span>
            </nav>

            {/* Category badge */}
            {article.category_name && (
              <span
                className="category-badge mb-4 inline-block"
                style={
                  article.category_color
                    ? { backgroundColor: article.category_color }
                    : undefined
                }
              >
                {article.category_name}
              </span>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
              {article.title}
            </h1>

            {/* Summary */}
            {article.summary && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-4 text-sm text-muted-foreground">
              {article.author_name && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.author_name}
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1 capitalize">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views_count + 1} visualizações
              </span>
            </div>

            {/* Cover Image */}
            {article.cover_image_url && (
              <div className="mt-6 overflow-hidden rounded-lg">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <article
              className="tiptap mt-8"
              dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
            />

            {/* Related articles */}
            {related.length > 0 && (
              <section className="mt-12 border-t border-border pt-8">
                <h2 className="font-heading text-xl font-bold mb-6">
                  Notícias Relacionadas
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {related.map((r) => (
                    <NewsCard key={r.id} article={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
