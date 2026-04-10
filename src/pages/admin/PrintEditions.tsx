import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Download,
  Upload,
  ExternalLink,
  Newspaper,
} from "lucide-react";

interface PrintEdition {
  id: string;
  title: string;
  edition_number: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  published_at: string | null;
  created_at: string;
}

interface EditionForm {
  title: string;
  edition_number: string;
  cover_image_url: string;
  pdf_url: string;
  published_at: string;
}

const INITIAL_FORM: EditionForm = {
  title: "",
  edition_number: "",
  cover_image_url: "",
  pdf_url: "",
  published_at: new Date().toISOString().slice(0, 10),
};

const AdminPrintEditions = () => {
  const [editions, setEditions] = useState<PrintEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<PrintEdition | null>(null);
  const [form, setForm] = useState<EditionForm>(INITIAL_FORM);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fetchEditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("print_editions")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar edições.");
    } else {
      setEditions(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const openCreate = () => {
    setEditingEdition(null);
    setForm(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEdit = (ed: PrintEdition) => {
    setEditingEdition(ed);
    setForm({
      title: ed.title,
      edition_number: ed.edition_number ?? "",
      cover_image_url: ed.cover_image_url ?? "",
      pdf_url: ed.pdf_url,
      published_at: ed.published_at
        ? new Date(ed.published_at).toISOString().slice(0, 10)
        : "",
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (
    file: File,
    folder: string,
    setUploading: (v: boolean) => void
  ): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("media")
      .upload(fileName, file, { cacheControl: "3600" });

    setUploading(false);

    if (error) {
      toast.error(`Erro no upload: ${error.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Selecione um arquivo PDF.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("PDF deve ter no máximo 50MB.");
      return;
    }
    const url = await handleFileUpload(file, "editions", setUploadingPdf);
    if (url) {
      setForm((prev) => ({ ...prev, pdf_url: url }));
      toast.success("PDF enviado.");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }
    const url = await handleFileUpload(file, "edition-covers", setUploadingCover);
    if (url) {
      setForm((prev) => ({ ...prev, cover_image_url: url }));
      toast.success("Capa enviada.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.pdf_url.trim()) {
      toast.error("Título e PDF são obrigatórios.");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      edition_number: form.edition_number.trim() || null,
      cover_image_url: form.cover_image_url || null,
      pdf_url: form.pdf_url,
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : new Date().toISOString(),
    };

    let error;
    if (editingEdition) {
      const res = await supabase
        .from("print_editions")
        .update(payload)
        .eq("id", editingEdition.id);
      error = res.error;
    } else {
      const res = await supabase.from("print_editions").insert(payload);
      error = res.error;
    }

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success(editingEdition ? "Edição atualizada." : "Edição criada.");
      setDialogOpen(false);
      fetchEditions();
    }
    setSaving(false);
  };

  const handleDelete = async (ed: PrintEdition) => {
    const { error } = await supabase
      .from("print_editions")
      .delete()
      .eq("id", ed.id);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success("Edição removida.");
      fetchEditions();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Jornal Impresso</h1>
          <p className="text-sm text-muted-foreground">
            {editions.length} edição(ões) cadastrada(s)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Edição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEdition ? "Editar Edição" : "Nova Edição"}
              </DialogTitle>
              <DialogDescription>
                Cadastre a edição impressa do jornal com o PDF para download.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    placeholder="Ex: Edição de Abril 2026"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número da Edição</Label>
                  <Input
                    placeholder="Ex: #145"
                    value={form.edition_number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        edition_number: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de Publicação</Label>
                <Input
                  type="date"
                  value={form.published_at}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, published_at: e.target.value }))
                  }
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                {form.pdf_url ? (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="text-sm truncate flex-1">PDF anexado</span>
                    <a
                      href={form.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, pdf_url: "" }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 hover:border-primary transition-colors">
                    {uploadingPdf ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploadingPdf ? "Enviando..." : "Clique para enviar PDF (até 50MB)"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                    />
                  </label>
                )}
              </div>

              {/* Cover Upload */}
              <div className="space-y-2">
                <Label>Imagem de Capa (opcional)</Label>
                {form.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={form.cover_image_url}
                      alt="Capa"
                      className="w-full max-h-48 object-contain rounded-lg border"
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
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 hover:border-primary transition-colors">
                    {uploadingCover ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {uploadingCover ? "Enviando..." : "Imagem da capa do jornal"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {editingEdition ? "Salvar" : "Criar Edição"}
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
      ) : editions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-heading text-lg font-semibold">
            Nenhuma edição impressa
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre a primeira edição do jornal impresso.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Primeira Edição
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {editions.map((ed) => (
            <div
              key={ed.id}
              className="group rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Cover */}
              <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                {ed.cover_image_url ? (
                  <img
                    src={ed.cover_image_url}
                    alt={ed.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Newspaper className="h-16 w-16 text-muted-foreground/30" />
                )}
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <h3 className="font-heading text-sm font-bold line-clamp-1">
                    {ed.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {ed.edition_number && <span>{ed.edition_number}</span>}
                    {ed.published_at && (
                      <span>
                        {new Date(ed.published_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={ed.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-1 h-3 w-3" />
                      PDF
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(ed)}
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
                        <AlertDialogTitle>
                          Remover "{ed.title}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta edição será removida permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(ed)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPrintEditions;
