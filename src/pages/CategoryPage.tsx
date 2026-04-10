import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard, { type PublicArticle } from "@/components/NewsCard";
import { Loader2, ArrowLeft } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      setLoading(true);
      setNotFound(false);

      // Fetch category
      const { data: cat, error } = await supabase
        .from("categories")
        .select("id, name, slug, color")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategoryName(cat.name);
      setCategoryColor(cat.color);
      document.title = `${cat.name} | O Catarinão`;

      // Also get subcategory IDs
      const { data: subcats } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", cat.id)
        .eq("is_active", true);

      const categoryIds = [cat.id, ...(subcats ?? []).map((s) => s.id)];

      // Fetch articles
      const { data: articlesData } = await supabase
        .from("articles")
        .select(
          "id, title, slug, summary, cover_image_url, published_at, is_featured, views_count, author_id, categories(name, slug, color)"
        )
        .eq("status", "published")
        .in("category_id", categoryIds)
        .order("published_at", { ascending: false })
        .limit(30);

      if (articlesData) {
        // Fetch author names
        const authorIds = [
          ...new Set(articlesData.map((a: any) => a.author_id).filter(Boolean)),
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

        setArticles(
          articlesData.map((a: any) => ({
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
            author_name: a.author_id
              ? profileMap.get(a.author_id) ?? null
              : null,
          }))
        );
      }

      setLoading(false);
    };

    fetchCategory();
  }, [slug]);

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
              Categoria não encontrada
            </h2>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>
          </div>
        ) : (
          <>
            {/* Category header */}
            <div className="mb-8 border-b-4 pb-4" style={{ borderColor: categoryColor ?? "hsl(var(--accent))" }}>
              <nav className="mb-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{categoryName}</span>
              </nav>
              <h1 className="font-heading text-3xl font-bold">
                {categoryName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {articles.length} notícia{articles.length !== 1 ? "s" : ""}{" "}
                publicada{articles.length !== 1 ? "s" : ""}
              </p>
            </div>

            {articles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhuma notícia nesta categoria ainda.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default CategoryPage;
