import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAllSiteSettings } from "@/hooks/useAllSiteSettings";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SiteFooter = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { general, social, footer } = useAllSiteSettings();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order");
      setCategories(data ?? []);
    };
    fetchCategories();
  }, []);

  const socialLinks = [
    { url: social.facebook, label: "Facebook", icon: Facebook },
    { url: social.instagram, label: "Instagram", icon: Instagram },
    { url: social.youtube, label: "YouTube", icon: Youtube },
    { url: social.twitter, label: "X (Twitter)", icon: Twitter },
    { url: social.whatsapp, label: "WhatsApp", icon: Mail },
  ].filter((s) => s.url);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/">
              <h3 className="font-heading text-2xl font-black">
                {general.site_name}
              </h3>
            </Link>
            {footer.about_text ? (
              <p className="mt-2 font-body text-sm opacity-70">
                {footer.about_text}
              </p>
            ) : (
              <p className="mt-2 font-body text-sm opacity-70">
                {general.site_subtitle}
              </p>
            )}

            {/* Social links */}
            {footer.show_social && socialLinks.length > 0 && (
              <div className="mt-4 flex gap-3">
                {socialLinks.map(({ url, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    aria-label={label}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          {footer.show_categories && (
            <div>
              <h4 className="font-heading text-lg font-bold">Editorias</h4>
              <ul className="mt-3 grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Institutional */}
          <div>
            <h4 className="font-heading text-lg font-bold">Institucional</h4>
            <ul className="mt-3 space-y-1.5">
              <li>
                <a
                  href="#"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  Equipe Editorial
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} {general.site_name} — Todos os
          direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
