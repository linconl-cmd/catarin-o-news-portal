import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  parent_id: string | null;
}

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siteSettings = useSiteSettings();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, color, parent_id")
        .eq("is_active", true)
        .order("sort_order");
      setAllCategories(data ?? []);
    };
    fetchCategories();
  }, []);

  const parentCategories = allCategories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId: string) =>
    allCategories.filter((c) => c.parent_id === parentId);

  const handleMouseEnter = (catId: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(catId);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
          <span className="hidden font-body text-xs opacity-80 sm:block capitalize">
            {today}
          </span>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Logo area */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex flex-1 items-center justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
          <Link to="/" className="text-center">
            {siteSettings.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={siteSettings.site_name}
                className="mx-auto h-14 object-contain md:h-16"
              />
            ) : (
              <h1 className="font-heading text-3xl font-black tracking-tight text-primary md:text-4xl">
                {siteSettings.site_name || "O CATARINÃO"}
              </h1>
            )}
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-foreground"
            >
              <Search size={20} />
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="container mx-auto">
              <Input
                placeholder="Buscar notícias..."
                className="max-w-md mx-auto"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden bg-primary md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1">
            {parentCategories.map((cat) => {
              const subs = getSubcategories(cat.id);
              const hasSubs = subs.length > 0;
              const isOpen = openDropdown === cat.id;

              return (
                <li
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => hasSubs && handleMouseEnter(cat.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="flex items-center gap-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:bg-secondary"
                  >
                    {cat.name}
                    {hasSubs && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {hasSubs && isOpen && (
                    <div
                      className="absolute left-0 top-full z-50 min-w-[200px] rounded-b-lg border border-t-0 border-border bg-card shadow-lg"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <ul className="py-1">
                        {subs.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              to={`/categoria/${sub.slug}`}
                              className="block px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-accent"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="border-b border-border bg-card md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {parentCategories.map((cat) => {
              const subs = getSubcategories(cat.id);
              const hasSubs = subs.length > 0;
              const isSubOpen = openMobileSub === cat.id;

              return (
                <li key={cat.id}>
                  <div className="flex items-center">
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className="flex-1 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setOpenMobileSub(isSubOpen ? null : cat.id)
                        }
                        aria-label={`Expandir ${cat.name}`}
                      >
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-200 ${isSubOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile subcategories */}
                  {hasSubs && isSubOpen && (
                    <ul className="ml-4 border-l-2 border-border pl-3 pb-2">
                      {subs.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to={`/categoria/${sub.slug}`}
                            className="block py-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
