import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Globe, Share2, FileText, Search } from "lucide-react";

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
};

const AdminSiteSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

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
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveSection = async (section: keyof Settings) => {
    setSaving(section);
    const { error } = await supabase
      .from("site_settings")
      .update({
        value: settings[section] as any,
        updated_by: user?.id ?? null,
      })
      .eq("key", section);

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
                <div className="space-y-2">
                  <Label>URL do Logo</Label>
                  <Input
                    placeholder="https://..."
                    value={settings.general.logo_url ?? ""}
                    onChange={(e) =>
                      updateField("general", "logo_url", e.target.value || null)
                    }
                  />
                  {settings.general.logo_url && (
                    <img
                      src={settings.general.logo_url}
                      alt="Logo"
                      className="h-12 mt-2 object-contain"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>URL do Favicon</Label>
                  <Input
                    placeholder="https://..."
                    value={settings.general.favicon_url ?? ""}
                    onChange={(e) =>
                      updateField("general", "favicon_url", e.target.value || null)
                    }
                  />
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
      </Tabs>
    </div>
  );
};

export default AdminSiteSettings;
