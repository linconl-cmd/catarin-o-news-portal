import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Eye,
  FileText,
  Star,
  Clock,
  Archive,
  Send,
} from "lucide-react";
import ArticleForm from "@/components/admin/ArticleForm";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  author_id: string | null;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
  categories?: { name: string; color: string | null } | null;
  author_name?: string | null;
}

interface Category {
  id: string;
  name: string;
}

const STATUS_CONFIG = {
  draft: {
    label: "Rascunho",
    variant: "secondary" as const,
    icon: FileText,
  },
  published: {
    label: "Publicado",
    variant: "default" as const,
    icon: Send,
  },
  archived: {
    label: "Arquivado",
    variant: "outline" as const,
    icon: Archive,
  },
};

const AdminPosts = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // View state: "list" or "form"
  const [view, setView] = useState<"list" | "form">("list");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, title, slug, summary, cover_image_url, category_id, author_id, status, is_featured, views_count, published_at, created_at, categories(name, color)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar artigos.");
      setLoading(false);
      return;
    }

    // Fetch author names from profiles
    const articles = (data as unknown as Article[]) ?? [];
    const authorIds = [...new Set(articles.map((a) => a.author_id).filter(Boolean))];

    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", authorIds as string[]);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p.full_name])
      );

      articles.forEach((a) => {
        if (a.author_id) {
          a.author_name = profileMap.get(a.author_id) ?? null;
        }
      });
    }

    setArticles(articles);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCategories(data ?? []);
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleDelete = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      toast.error(`Erro ao remover: ${error.message}`);
    } else {
      toast.success("Artigo removido.");
      fetchArticles();
    }
  };

  const handleQuickPublish = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success("Artigo publicado!");
      fetchArticles();
    }
  };

  const handleQuickArchive = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ status: "archived" })
      .eq("id", article.id);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success("Artigo arquivado.");
      fetchArticles();
    }
  };

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || a.status === filterStatus;

    const matchesCategory =
      filterCategory === "all" || a.category_id === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
    featured: articles.filter((a) => a.is_featured).length,
  };

  if (view === "form") {
    return (
      <ArticleForm
        articleId={editingArticleId}
        onBack={() => {
          setView("list");
          setEditingArticleId(null);
        }}
        onSaved={() => {
          setView("list");
          setEditingArticleId(null);
          fetchArticles();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Gestão de Notícias
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} artigos · {stats.published} publicados ·{" "}
            {stats.draft} rascunhos · {stats.featured} destaques
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingArticleId(null);
            setView("form");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Notícia
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-heading text-lg font-semibold">
            {articles.length === 0
              ? "Nenhum artigo ainda"
              : "Nenhum resultado"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length === 0
              ? "Crie sua primeira notícia para começar."
              : "Tente ajustar os filtros de busca."}
          </p>
          {articles.length === 0 && (
            <Button
              className="mt-4"
              onClick={() => {
                setEditingArticleId(null);
                setView("form");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Notícia
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[130px]">Categoria</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-center">Views</TableHead>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => {
                const statusConf = STATUS_CONFIG[article.status];
                const StatusIcon = statusConf.icon;

                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.cover_image_url ? (
                        <img
                          src={article.cover_image_url}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium line-clamp-1">
                            {article.title}
                          </span>
                          {article.is_featured && (
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{article.slug}
                          {article.author_name && (
                            <> · {article.author_name}</>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.categories ? (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor:
                              article.categories.color ?? undefined,
                            color: article.categories.color ?? undefined,
                          }}
                        >
                          {article.categories.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConf.variant} className="text-xs">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.views_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString(
                              "pt-BR"
                            )
                          : new Date(article.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickPublish(article)}
                            title="Publicar"
                          >
                            <Send className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        {article.status === "published" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickArchive(article)}
                            title="Arquivar"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingArticleId(article.id);
                            setView("form");
                          }}
                          title="Editar"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Remover">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remover artigo?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                "{article.title}" será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(article)}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
