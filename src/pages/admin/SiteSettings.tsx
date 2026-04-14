import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Globe, Share2, FileText, Search, Upload, X, Megaphone, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Settings {
  general: {
    site_name: string;
    site_subtitle: string;
    logo_url: string | null;
    favicon_url: string | null;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    whatsapp: string;
  };
  footer: {
    about_text: string;
    show_categories: boolean;
    show_social: boolean;
  };
  seo: {
    default_meta_title: string;
    default_meta_description: string;
  };
  ads: {
    enabled: boolean;
    header_banner_url: string | null;
    header_link: string;
    sidebar_banner_url: string | null;
    sidebar_link: string;
    inline_banner_url: string | null;
    inline_link: string;
  };
}

const DEFAULT_SETTINGS: Settings = {
  general: {
    site_name: "O CATARINÃO",
    site_subtitle: "Notícias de Santa Catarina",
    logo_url: null,
    favicon_url: null,
  },
  social: { facebook: "", instagram: "", youtube: "", twitter: "", whatsapp: "" },
  footer: { about_text: "", show_categories: true, show_social: true },
  seo: { default_meta_title: "", default_meta_description: "" },
  ads: {
    enabled: false,
    header_banner_url: null,
    header_link: "",
    sidebar_banner_url: null,
    sidebar_link: "",
    inline_banner_url: null,
    inline_link: "",
  },
};

interface MetaSettings {
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_url: string;
  twitter_card: string;
}

const DEFAULT_META: MetaSettings = {
  og_title: "O Catarinão - Notícias de Santa Catarina",
  og_description: "Portal de notícias de Santa Catarina.",
  og_image_url: "",
  og_url: "https://ocatarinao.vercel.app",
  twitter_card: "summary_large_image",
};

const META_ROW_ID = "00000000-0000-0000-0000-000000000001";

type AdSlot = "header" | "sidebar" | "inline";

const AdminSiteSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [metaSettings, setMetaSettings] = useState<MetaSettings>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const adInputRefs = {
    header: useRef<HTMLInputElement>(null),
    sidebar: useRef<HTMLInputElement>(null),
    inline: useRef<HTMLInputElement>(null),
  };

  const uploadAdBanner = async (file: File, slot: AdSlot) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máx 5MB.");
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPG, WEBP ou GIF.");
      return;
    }
    setUploading(`ad-${slot}`);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `ads/${slot}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(fileName, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(fileName);
      updateField("ads", `${slot}_banner_url` as any, pub.publicUrl);
      toast.success("Banner enviado!");
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const uploadImage = async (
    file: File,
    field: "logo_url" | "favicon_url",
    kind: "logo" | "favicon"
  ) => {
    // Validate size (2MB max for logo/favicon)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máx 2MB.");
      return;
    }
    // Validate type
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use PNG, JPG, WEBP, SVG ou ICO.");
      return;
    }

    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `branding/${kind}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(fileName, file, { upsert: true, cacheControl: "3600" });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("media").getPublicUrl(fileName);
      updateField("general", field, pub.publicUrl);
      toast.success(`${kind === "logo" ? "Logo" : "Favicon"} enviado!`);
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (!error && data) {
        const mapped = { ...DEFAULT_SETTINGS };
        data.forEach((row) => {
          const key = row.key as keyof Settings;
          if (key in mapped) {
            mapped[key] = { ...mapped[key], ...(row.value as any) };
          }
        });
        setSettings(mapped);
      }
      // Fetch meta settings from separate table
      const { data: metaData } = await supabase
        .from("site_meta_settings")
        .select("og_title, og_description, og_image_url, og_url, twitter_card")
        .eq("id", META_ROW_ID)
        .single();

      if (metaData) {
        setMetaSettings({
          og_title: metaData.og_title ?? DEFAULT_META.og_title,
          og_description: metaData.og_description ?? DEFAULT_META.og_description,
          og_image_url: metaData.og_image_url ?? "",
          og_url: metaData.og_url ?? DEFAULT_META.og_url,
          twitter_card: metaData.twitter_card ?? DEFAULT_META.twitter_card,
        });
      }

      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveMetaSettings = async () => {
    setSavingMeta(true);
    const { error } = await supabase
      .from("site_meta_settings")
      .update({
        ...metaSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", META_ROW_ID);

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success("Configurações de SEO/compartilhamento salvas!");
    }
    setSavingMeta(false);
  };

  const saveSection = async (section: keyof Settings) => {
    setSaving(section);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: section,
          value: settings[section] as any,
          updated_by: user?.id ?? null,
        },
        { onConflict: "key" }
      );

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success("Configurações salvas!");
    }
    setSaving(null);
  };

  const updateField = <S extends keyof Settings>(
    section: S,
    field: keyof Settings[S],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
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
        <h1 className="font-heading text-2xl font-bold">Configurações do Site</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações gerais, redes sociais, footer e SEO.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" /> Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <FileText className="h-4 w-4" /> Footer
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-2">
            <Megaphone className="h-4 w-4" /> Anúncios
          </TabsTrigger>
          <TabsTrigger value="opengraph" className="gap-2">
            <ExternalLink className="h-4 w-4" /> SEO e Compartilhamento
          </TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Nome do site, subtítulo, logo e favicon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Site</Label>
                  <Input
                    value={settings.general.site_name}
                    onChange={(e) =>
                      updateField("general", "site_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={settings.general.site_subtitle}
                    onChange={(e) =>
                      updateField("general", "site_subtitle", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* LOGO */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    {settings.general.logo_url ? (
                      <div className="relative group">
                        <div className="flex items-center justify-center rounded-md bg-muted/30 p-4 min-h-[80px]">
                          <img
                            src={settings.general.logo_url}
                            alt="Logo"
                            className="h-16 object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() =>
                            updateField("general", "logo_url", null)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md bg-muted/30 p-8 text-xs text-muted-foreground">
                        Nenhum logo enviado
                      </div>
                    )}

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f, "logo_url", "logo");
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploading === "logo"}
                    >
                      {uploading === "logo" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {settings.general.logo_url ? "Trocar Logo" : "Enviar Logo"}
                    </Button>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Ou cole uma URL
                      </Label>
                      <Input
                        placeholder="https://..."
                        value={settings.general.logo_url ?? ""}
                        onChange={(e) =>
                          updateField(
                            "general",
                            "logo_url",
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP ou SVG. Máx 2MB.
                    </p>
                  </div>
                </div>

                {/* FAVICON */}
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    {settings.general.favicon_url ? (
                      <div className="relative group">
                        <div className="flex items-center justify-center rounded-md bg-muted/30 p-4 min-h-[80px]">
                          <img
                            src={settings.general.favicon_url}
                            alt="Favicon"
                            className="h-12 w-12 object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() =>
                            updateField("general", "favicon_url", null)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md bg-muted/30 p-8 text-xs text-muted-foreground">
                        Nenhum favicon enviado
                      </div>
                    )}

                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f, "favicon_url", "favicon");
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploading === "favicon"}
                    >
                      {uploading === "favicon" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {settings.general.favicon_url
                        ? "Trocar Favicon"
                        : "Enviar Favicon"}
                    </Button>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Ou cole uma URL
                      </Label>
                      <Input
                        placeholder="https://..."
                        value={settings.general.favicon_url ?? ""}
                        onChange={(e) =>
                          updateField(
                            "general",
                            "favicon_url",
                            e.target.value || null
                          )
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ICO, PNG ou SVG. Recomendado 32x32 ou 64x64.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => saveSection("general")}
                disabled={saving === "general"}
              >
                {saving === "general" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Links das redes sociais exibidos no header e footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["facebook", "Facebook", "https://facebook.com/..."],
                  ["instagram", "Instagram", "https://instagram.com/..."],
                  ["youtube", "YouTube", "https://youtube.com/..."],
                  ["twitter", "X (Twitter)", "https://x.com/..."],
                  ["whatsapp", "WhatsApp", "https://wa.me/55..."],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    placeholder={placeholder}
                    value={settings.social[key]}
                    onChange={(e) =>
                      updateField("social", key, e.target.value)
                    }
                  />
                </div>
              ))}
              <Button
                onClick={() => saveSection("social")}
                disabled={saving === "social"}
              >
                {saving === "social" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
              <CardDescription>
                Texto sobre o site e opções de exibição no rodapé.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texto "Sobre"</Label>
                <Textarea
                  rows={4}
                  placeholder="Breve descrição do portal..."
                  value={settings.footer.about_text}
                  onChange={(e) =>
                    updateField("footer", "about_text", e.target.value)
                  }
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.footer.show_categories}
                    onChange={(e) =>
                      updateField("footer", "show_categories", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Mostrar categorias no footer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.footer.show_social}
                    onChange={(e) =>
                      updateField("footer", "show_social", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Mostrar redes sociais no footer</span>
                </label>
              </div>
              <Button
                onClick={() => saveSection("footer")}
                disabled={saving === "footer"}
              >
                {saving === "footer" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Padrão</CardTitle>
              <CardDescription>
                Meta tags padrão para páginas que não tenham SEO personalizado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title Padrão</Label>
                <Input
                  placeholder="O CATARINÃO - Notícias de Santa Catarina"
                  value={settings.seo.default_meta_title}
                  onChange={(e) =>
                    updateField("seo", "default_meta_title", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {settings.seo.default_meta_title.length}/60 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description Padrão</Label>
                <Textarea
                  rows={3}
                  placeholder="Descrição do site para motores de busca..."
                  value={settings.seo.default_meta_description}
                  onChange={(e) =>
                    updateField(
                      "seo",
                      "default_meta_description",
                      e.target.value
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {settings.seo.default_meta_description.length}/160 caracteres
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview no Google
                </p>
                <p className="text-sm font-medium text-blue-700 line-clamp-1">
                  {settings.seo.default_meta_title || "Título do site"}
                </p>
                <p className="text-xs text-green-700">ocatarinao.com.br</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {settings.seo.default_meta_description || "Descrição do site..."}
                </p>
              </div>

              <Button
                onClick={() => saveSection("seo")}
                disabled={saving === "seo"}
              >
                {saving === "seo" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPEN GRAPH / SEO E COMPARTILHAMENTO */}
        <TabsContent value="opengraph">
          <Card>
            <CardHeader>
              <CardTitle>SEO e Compartilhamento</CardTitle>
              <CardDescription>
                Essas informações aparecem quando o link do portal é compartilhado no WhatsApp, redes sociais etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título do site (og:title)</Label>
                <Input
                  placeholder="O Catarinão - Notícias de Santa Catarina"
                  value={metaSettings.og_title}
                  onChange={(e) =>
                    setMetaSettings((prev) => ({ ...prev, og_title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (og:description)</Label>
                <Textarea
                  rows={3}
                  placeholder="Portal de notícias de Santa Catarina."
                  value={metaSettings.og_description}
                  onChange={(e) =>
                    setMetaSettings((prev) => ({ ...prev, og_description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL da imagem de compartilhamento (og:image)</Label>
                <Input
                  placeholder="https://..."
                  value={metaSettings.og_image_url}
                  onChange={(e) =>
                    setMetaSettings((prev) => ({ ...prev, og_image_url: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1200x630 pixels. Aparece como miniatura ao compartilhar o link.
                </p>
              </div>
              <div className="space-y-2">
                <Label>URL do site (og:url)</Label>
                <Input
                  placeholder="https://ocatarinao.vercel.app"
                  value={metaSettings.og_url}
                  onChange={(e) =>
                    setMetaSettings((prev) => ({ ...prev, og_url: e.target.value }))
                  }
                />
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview de compartilhamento
                </p>
                <div className="rounded-md border overflow-hidden">
                  {metaSettings.og_image_url && (
                    <div className="bg-muted/30 flex items-center justify-center h-40">
                      <img
                        src={metaSettings.og_image_url}
                        alt="OG Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">
                      {metaSettings.og_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </p>
                    <p className="text-sm font-semibold line-clamp-1">
                      {metaSettings.og_title || "Título do site"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {metaSettings.og_description || "Descrição do site..."}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={saveMetaSettings} disabled={savingMeta}>
                {savingMeta ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADS */}
        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Espaços Publicitários</CardTitle>
              <CardDescription>
                Ative, desative e gerencie os banners publicitários do site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Exibir anúncios</p>
                  <p className="text-xs text-muted-foreground">
                    Ativa ou desativa todos os espaços publicitários do site.
                  </p>
                </div>
                <Switch
                  checked={settings.ads.enabled}
                  onCheckedChange={(v) => updateField("ads", "enabled", v)}
                />
              </div>

              {/* Ad slots */}
              {(
                [
                  {
                    slot: "header" as AdSlot,
                    label: "Banner do Topo (Header)",
                    description: "Exibido no topo da home. Recomendado: 728x90 ou 970x250.",
                    field: "header_banner_url" as const,
                    linkField: "header_link" as const,
                  },
                  {
                    slot: "sidebar" as AdSlot,
                    label: "Banner Lateral (Sidebar)",
                    description: "Exibido na coluna lateral. Recomendado: 300x250 ou 300x600.",
                    field: "sidebar_banner_url" as const,
                    linkField: "sidebar_link" as const,
                  },
                  {
                    slot: "inline" as AdSlot,
                    label: "Banner Interno (Dentro de artigos)",
                    description: "Exibido entre parágrafos. Recomendado: 728x90 ou 468x60.",
                    field: "inline_banner_url" as const,
                    linkField: "inline_link" as const,
                  },
                ]
              ).map(({ slot, label, description, field, linkField }) => {
                const url = settings.ads[field];
                const isUploading = uploading === `ad-${slot}`;
                return (
                  <div
                    key={slot}
                    className="rounded-lg border border-dashed p-4 space-y-3"
                  >
                    <div>
                      <Label className="text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>

                    {url ? (
                      <div className="relative">
                        <div className="flex items-center justify-center rounded-md bg-muted/30 p-4 min-h-[100px]">
                          <img
                            src={url}
                            alt={label}
                            className="max-h-32 object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() => updateField("ads", field, null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md bg-muted/30 p-8 text-xs text-muted-foreground">
                        Nenhum banner enviado
                      </div>
                    )}

                    <input
                      ref={adInputRefs[slot]}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAdBanner(f, slot);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => adInputRefs[slot].current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {url ? "Trocar Banner" : "Enviar Banner"}
                    </Button>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Link ao clicar (opcional)
                      </Label>
                      <Input
                        placeholder="https://anunciante.com.br"
                        value={settings.ads[linkField]}
                        onChange={(e) =>
                          updateField("ads", linkField, e.target.value)
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP ou GIF. Máx 5MB.
                    </p>
                  </div>
                );
              })}

              <Button
                onClick={() => saveSection("ads")}
                disabled={saving === "ads"}
              >
                {saving === "ads" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSiteSettings;
