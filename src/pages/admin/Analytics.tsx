import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  FileText,
  TrendingUp,
  BarChart3,
  Loader2,
  FolderTree,
  Star,
} from "lucide-react";

interface ArticleStat {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  published_at: string | null;
  category_name: string | null;
}

interface CategoryStat {
  name: string;
  slug: string;
  color: string | null;
  article_count: number;
  total_views: number;
}

const AdminAnalytics = () => {
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch articles with category
      const { data: articlesData } = await supabase
        .from("articles")
        .select("id, title, slug, status, views_count, published_at, categories(name)")
        .order("views_count", { ascending: false })
        .limit(20);

      const mapped = (articlesData ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        views_count: a.views_count,
        published_at: a.published_at,
        category_name: a.categories?.name ?? null,
      }));
      setArticles(mapped);

      // Compute category stats from all articles
      const { data: allArticles } = await supabase
        .from("articles")
        .select("views_count, category_id, categories(name, slug, color)")
        .eq("status", "published");

      const catMap = new Map<
        string,
        { name: string; slug: string; color: string | null; count: number; views: number }
      >();

      (allArticles ?? []).forEach((a: any) => {
        if (!a.categories) return;
        const key = a.categories.slug;
        const existing = catMap.get(key);
        if (existing) {
          existing.count++;
          existing.views += a.views_count ?? 0;
        } else {
          catMap.set(key, {
            name: a.categories.name,
            slug: a.categories.slug,
            color: a.categories.color,
            count: 1,
            views: a.views_count ?? 0,
          });
        }
      });

      setCategoryStats(
        Array.from(catMap.values())
          .map((c) => ({
            name: c.name,
            slug: c.slug,
            color: c.color,
            article_count: c.count,
            total_views: c.views,
          }))
          .sort((a, b) => b.total_views - a.total_views)
      );

      setLoading(false);
    };

    fetchData();
  }, []);

  const totalViews = articles.reduce((s, a) => s + a.views_count, 0);
  const totalPublished = articles.filter((a) => a.status === "published").length;
  const avgViews = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;
  const topArticle = articles[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Métricas internas de visualizações e desempenho.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Views
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Artigos Publicados
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPublished}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Artigo
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgViews.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mais Lido
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold line-clamp-1">
              {topArticle?.title ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topArticle ? `${topArticle.views_count} views` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top articles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Artigos por Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Artigo</TableHead>
                    <TableHead className="w-[100px]">Categoria</TableHead>
                    <TableHead className="w-[80px] text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles
                    .filter((a) => a.status === "published")
                    .slice(0, 15)
                    .map((article, i) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-bold text-muted-foreground/50">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm line-clamp-1">
                            {article.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {article.published_at
                              ? new Date(article.published_at).toLocaleDateString(
                                  "pt-BR"
                                )
                              : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.category_name ? (
                            <Badge variant="outline" className="text-xs">
                              {article.category_name}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {article.views_count.toLocaleString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Category stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4" />
              Views por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sem dados ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((cat) => {
                  const maxViews = categoryStats[0]?.total_views || 1;
                  const percentage = Math.round(
                    (cat.total_views / maxViews) * 100
                  );
                  return (
                    <div key={cat.slug} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {cat.total_views} views · {cat.article_count} artigo
                          {cat.article_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color ?? "hsl(var(--primary))",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
