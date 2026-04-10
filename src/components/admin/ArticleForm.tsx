import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Clock,
  ImageIcon,
  Search,
  Upload,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
}

interface ArticleFormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string;
  category_id: string | null;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  status: "draft" | "published" | "archived";
  scheduled_at: string;
}

interface ArticleFormProps {
  articleId?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

const INITIAL_FORM: ArticleFormData = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover_image_url: "",
  category_id: null,
  is_featured: false,
  meta_title: "",
  meta_description: "",
  status: "draft",
  scheduled_at: "",
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ArticleForm = ({ articleId, onBack, onSaved }: ArticleFormProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!articleId);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!articleId);
  const [uploading, setUploading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, is_active")
        .eq("is_active", true)
        .order("sort_order");
      setCategories(data ?? []);
    };
    fetchCategories();
  }, []);

  // Fetch article if editing
  useEffect(() => {
    if (!articleId) return;
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (error || !data) {
        toast.error("Erro ao carregar artigo.");
        onBack();
        return;
      }

      setForm({
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? "",
        content: data.content ?? "",
        cover_image_url: data.cover_image_url ?? "",
        category_id: data.category_id,
        is_featured: data.is_featured,
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        status: data.status,
        scheduled_at: data.scheduled_at
          ? new Date(data.scheduled_at).toISOString().slice(0, 16)
          : "",
      });
      setAutoSlug(false);
      setLoading(false);
    };
    fetchArticle();
  }, [articleId]);

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent_id),
    [categories]
  );

  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
      meta_title: prev.meta_title || title,
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("media")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error(`Erro ao enviar imagem: ${error.message}`);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(data.path);

    setForm((prev) => ({ ...prev, cover_image_url: publicUrl }));
    setUploading(false);
    toast.success("Imagem enviada.");
  };

  const handleSave = async (publishNow = false) => {
    if (!form.title.trim()) {
      toast.error("Título é obrigatório.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug é obrigatório.");
      return;
    }

    setSaving(true);

    const status = publishNow ? "published" : form.status;
    const now = new Date().toISOString();

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim() || null,
      content: form.content || null,
      cover_image_url: form.cover_image_url || null,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      status,
      published_at: publishNow ? now : undefined,
      scheduled_at: form.scheduled_at
        ? new Date(form.scheduled_at).toISOString()
        : null,
      author_id: user?.id ?? null,
    };

    let error;

    if (articleId) {
      const result = await supabase
        .from("articles")
        .update(payload)
        .eq("id", articleId);
      error = result.error;
    } else {
      const result = await supabase.from("articles").insert(payload);
      error = result.error;
    }

    if (error) {
      if (error.code === "23505") {
        toast.error("Já existe um artigo com este slug.");
      } else {
        toast.error(`Erro ao salvar: ${error.message}`);
      }
      setSaving(false);
      return;
    }

    toast.success(
      publishNow
        ? "Artigo publicado!"
        : articleId
          ? "Artigo atualizado."
          : "Rascunho salvo."
    );
    setSaving(false);
    onSaved();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="font-heading text-xl font-bold">
            {articleId ? "Editar Notícia" : "Nova Notícia"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content - 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="art-title">Título</Label>
            <Input
              id="art-title"
              placeholder="Título da notícia..."
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="art-slug">Slug (URL)</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>/noticia/</span>
              <Input
                id="art-slug"
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="art-summary">Resumo / Subtítulo</Label>
            <Textarea
              id="art-summary"
              placeholder="Breve resumo da notícia que aparece na listagem..."
              value={form.summary}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  summary: e.target.value,
                  meta_description:
                    prev.meta_description || e.target.value.slice(0, 160),
                }))
              }
              rows={3}
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <RichTextEditor
              content={form.content}
              onChange={(content) =>
                setForm((prev) => ({ ...prev, content }))
              }
            />
          </div>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">
                Geral
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex-1">
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                {form.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={form.cover_image_url}
                      alt="Capa"
                      className="w-full rounded-lg object-cover aspect-video"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, cover_image_url: "" }))
                      }
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {uploading
                          ? "Enviando..."
                          : "Clique para enviar imagem"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={uploading}
                      />
                    </label>
                    <div className="text-center text-xs text-muted-foreground">
                      ou
                    </div>
                    <Input
                      placeholder="Cole a URL da imagem..."
                      value={form.cover_image_url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          cover_image_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category_id ?? "none"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: v === "none" ? null : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {parentCategories.map((cat) => (
                      <div key={cat.id}>
                        <SelectItem value={cat.id}>{cat.name}</SelectItem>
                        {getSubcategories(cat.id).map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            &nbsp;&nbsp;↳ {sub.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: "draft" | "published" | "archived") =>
                    setForm((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label htmlFor="art-schedule">
                  <Clock className="mr-1 inline h-3 w-3" />
                  Agendar Publicação
                </Label>
                <Input
                  id="art-schedule"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      scheduled_at: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Switch
                  id="art-featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, is_featured: checked }))
                  }
                />
                <Label htmlFor="art-featured" className="cursor-pointer">
                  Notícia Destaque
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="art-meta-title">Meta Title</Label>
                <Input
                  id="art-meta-title"
                  placeholder="Título para SEO..."
                  value={form.meta_title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {form.meta_title.length}/60 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="art-meta-desc">Meta Description</Label>
                <Textarea
                  id="art-meta-desc"
                  placeholder="Descrição para SEO..."
                  value={form.meta_description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {form.meta_description.length}/160 caracteres
                </p>
              </div>

              {/* SEO Preview */}
              <div className="space-y-1 rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview no Google
                </p>
                <p className="text-sm font-medium text-blue-700 line-clamp-1">
                  {form.meta_title || form.title || "Título da notícia"}
                </p>
                <p className="text-xs text-green-700">
                  ocatarinao.com.br/noticia/{form.slug || "slug-da-noticia"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {form.meta_description ||
                    form.summary ||
                    "Descrição da notícia..."}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;
