import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SiteFooter = () => {
  const [categories, setCategories] = useState<Category[]>([]);

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

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/">
              <h3 className="font-heading text-2xl font-black">O CATARIN&Atilde;O</h3>
            </Link>
            <p className="mt-2 font-body text-sm opacity-70">
              O seu portal de notícias de Santa Catarina. Jornalismo sério,
              independente e comprometido com a verdade.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="#"
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Categories */}
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
          &copy; {new Date().getFullYear()} O Catarin&atilde;o — Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
