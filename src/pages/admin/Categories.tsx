import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderTree,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  parent_id: string | null;
  is_active: boolean;
}

const INITIAL_FORM: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  color: "#0d9488",
  parent_id: null,
  is_active: true,
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(INITIAL_FORM);
  const [autoSlug, setAutoSlug] = useState(true);

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parent_id),
    [categories]
  );

  const getSubcategories = (parentId: string) =>
    categories
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar categorias.");
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateDialog = (parentId?: string) => {
    setEditingCategory(null);
    setForm({ ...INITIAL_FORM, parent_id: parentId ?? null });
    setAutoSlug(true);
    setDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      color: cat.color ?? "#0d9488",
      parent_id: cat.parent_id,
      is_active: cat.is_active,
    });
    setAutoSlug(false);
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Nome e slug são obrigatórios.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      color: form.color,
      parent_id: form.parent_id || null,
      is_active: form.is_active,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingCategory.id);

      if (error) {
        toast.error(`Erro ao atualizar: ${error.message}`);
      } else {
        toast.success("Categoria atualizada.");
      }
    } else {
      const maxOrder = categories
        .filter((c) => c.parent_id === form.parent_id)
        .reduce((max, c) => Math.max(max, c.sort_order), -1);

      const { error } = await supabase
        .from("categories")
        .insert({ ...payload, sort_order: maxOrder + 1 });

      if (error) {
        if (error.code === "23505") {
          toast.error("Já existe uma categoria com este slug.");
        } else {
          toast.error(`Erro ao criar: ${error.message}`);
        }
      } else {
        toast.success("Categoria criada.");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (cat: Category) => {
    const subs = getSubcategories(cat.id);
    if (subs.length > 0) {
      toast.error("Remova as subcategorias primeiro.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", cat.id);

    if (error) {
      toast.error(`Erro ao remover: ${error.message}`);
    } else {
      toast.success("Categoria removida.");
      fetchCategories();
    }
  };

  const handleReorder = async (cat: Category, direction: "up" | "down") => {
    const siblings = categories
      .filter((c) => c.parent_id === cat.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const idx = siblings.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;

    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const current = siblings[idx];
    const swap = siblings[swapIdx];

    await Promise.all([
      supabase
        .from("categories")
        .update({ sort_order: swap.sort_order })
        .eq("id", current.id),
      supabase
        .from("categories")
        .update({ sort_order: current.sort_order })
        .eq("id", swap.id),
    ]);

    fetchCategories();
  };

  const renderCategoryRow = (cat: Category, isChild = false) => {
    const subs = getSubcategories(cat.id);
    const siblings = categories
      .filter((c) => c.parent_id === cat.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = siblings.findIndex((c) => c.id === cat.id);

    return (
      <TableRow key={cat.id} className={isChild ? "bg-muted/30" : ""}>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={idx === 0}
                onClick={() => handleReorder(cat, "up")}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={idx === siblings.length - 1}
                onClick={() => handleReorder(cat, "down")}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isChild && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color ?? "#0d9488" }}
              />
              <div>
                <div className="font-medium">{cat.name}</div>
                <div className="text-xs text-muted-foreground">/{cat.slug}</div>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {cat.description ? (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {cat.description}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
        </TableCell>
        <TableCell>
          {!isChild && (
            <Badge variant="outline" className="text-xs">
              {subs.length} sub{subs.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={cat.is_active ? "default" : "secondary"}
            className="text-xs"
          >
            {cat.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {!isChild && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreateDialog(cat.id)}
                title="Adicionar subcategoria"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(cat)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover "{cat.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {subs.length > 0
                      ? `Esta categoria tem ${subs.length} subcategoria(s). Remova-as primeiro.`
                      : "Esta ação não pode ser desfeita. Artigos vinculados ficarão sem categoria."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(cat)}
                    disabled={subs.length > 0}
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Categorias e Subcategorias
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize as categorias do portal. Arraste para reordenar.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCreateDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {form.parent_id
                  ? `Subcategoria de "${parentCategories.find((p) => p.id === form.parent_id)?.name ?? ""}"`
                  : "Categoria principal do portal."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                  id="cat-name"
                  placeholder="Ex: Política"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cat-slug"
                    placeholder="ex: politica"
                    value={form.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setForm((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-desc">Descrição (opcional)</Label>
                <Input
                  id="cat-desc"
                  placeholder="Breve descrição da categoria"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-color">Cor</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="cat-color"
                      value={form.color}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="h-9 w-12 cursor-pointer rounded border"
                    />
                    <Input
                      value={form.color}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-parent">Categoria Pai</Label>
                  <Select
                    value={form.parent_id ?? "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        parent_id: v === "none" ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma (raiz)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                      {parentCategories
                        .filter((p) => p.id !== editingCategory?.id)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="cat-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="cat-active">Categoria ativa</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : editingCategory ? (
                    "Salvar Alterações"
                  ) : (
                    "Criar Categoria"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-heading text-lg font-semibold">
            Nenhuma categoria
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie a primeira categoria para começar a organizar o portal.
          </p>
          <Button className="mt-4" onClick={() => openCreateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeira Categoria
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]">Subcategorias</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parentCategories
                .sort((a, b) => a.sort_order - b.sort_order)
                .flatMap((cat) => [
                  renderCategoryRow(cat, false),
                  ...getSubcategories(cat.id).map((sub) =>
                    renderCategoryRow(sub, true)
                  ),
                ])}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
