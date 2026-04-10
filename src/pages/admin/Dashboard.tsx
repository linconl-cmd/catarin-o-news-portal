import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderTree,
  Users,
  Eye,
  TrendingUp,
  Clock,
  Send,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface RecentArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  created_at: string;
  published_at: string | null;
}

const AdminDashboard = () => {
  const { user, roles } = useAuth();
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    featuredArticles: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [topArticles, setTopArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      // Fetch all stats in parallel
      const [articlesRes, categoriesRes, usersRes, recentRes, topRes] =
        await Promise.all([
          supabase.from("articles").select("id, status, is_featured, views_count"),
          supabase.from("categories").select("id").eq("is_active", true),
          supabase.from("user_roles").select("id"),
          supabase
            .from("articles")
            .select("id, title, slug, status, views_count, created_at, published_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("articles")
            .select("id, title, slug, status, views_count, created_at, published_at")
            .eq("status", "published")
            .order("views_count", { ascending: false })
            .limit(5),
        ]);

      const articles = articlesRes.data ?? [];
      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === "published").length,
        draftArticles: articles.filter((a) => a.status === "draft").length,
        featuredArticles: articles.filter((a) => a.is_featured).length,
        totalCategories: categoriesRes.data?.length ?? 0,
        totalUsers: usersRes.data?.length ?? 0,
        totalViews: articles.reduce((sum, a) => sum + (a.views_count ?? 0), 0),
      });

      setRecentArticles((recentRes.data as RecentArticle[]) ?? []);
      setTopArticles((topRes.data as RecentArticle[]) ?? []);
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const statCards = [
    {
      title: "Notícias",
      value: stats.totalArticles,
      icon: FileText,
      description: `${stats.publishedArticles} publicadas · ${stats.draftArticles} rascunhos`,
      color: "text-blue-500",
      link: "/admin/posts",
    },
    {
      title: "Categorias",
      value: stats.totalCategories,
      icon: FolderTree,
      description: "Categorias ativas",
      color: "text-green-500",
      link: "/admin/categories",
    },
    {
      title: "Usuários",
      value: stats.totalUsers,
      icon: Users,
      description: "Usuários com acesso",
      color: "text-purple-500",
      link: "/admin/users",
    },
    {
      title: "Visualizações",
      value: stats.totalViews.toLocaleString("pt-BR"),
      icon: Eye,
      description: "Total acumulado",
      color: "text-orange-500",
      link: "/admin/analytics",
    },
  ];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="text-xs">Publicado</Badge>;
      case "draft":
        return <Badge variant="secondary" className="text-xs">Rascunho</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Arquivado</Badge>;
    }
  };

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
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.email}.{" "}
          <strong className="text-primary capitalize">
            {roles.join(", ") || "Sem role"}
          </strong>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent + Top Articles */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Artigos Recentes
            </CardTitle>
            <Link
              to="/admin/posts"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum artigo criado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(article.created_at)}
                      </p>
                    </div>
                    {statusBadge(article.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top viewed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Mais Lidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum artigo publicado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {topArticles.map((article, i) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg font-bold text-muted-foreground/40 w-6 text-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {article.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Eye className="h-3 w-3" />
                      {article.views_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
