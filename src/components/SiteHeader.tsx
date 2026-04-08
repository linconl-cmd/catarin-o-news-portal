import { useState } from "react";
import { Search, Menu, X, Facebook, Instagram, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockNews";

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
          <span className="hidden font-body text-xs opacity-80 sm:block">
            Terça-feira, 8 de Abril de 2026
          </span>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="opacity-70 transition-opacity hover:opacity-100">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="Instagram" className="opacity-70 transition-opacity hover:opacity-100">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="YouTube" className="opacity-70 transition-opacity hover:opacity-100">
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Logo area */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="font-heading text-3xl font-black tracking-tight text-primary md:text-4xl">
              O CATARINÃO
            </h1>
            <p className="font-body text-xs tracking-widest text-muted-foreground">
              JORNALISMO DE SANTA CATARINA
            </p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-foreground"
            >
              <Search size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
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

      {/* Navigation */}
      <nav className="hidden bg-primary md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1">
            {categories.map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  className="block px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:bg-secondary"
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-b border-border bg-card md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {categories.map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  className="block py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-accent"
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
