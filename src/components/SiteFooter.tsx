import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { categories } from "@/data/mockNews";

const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-black">O CATARINÃO</h3>
            <p className="mt-2 font-body text-sm opacity-70">
              O seu portal de notícias de Santa Catarina. Jornalismo sério, independente e comprometido com a verdade.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-lg font-bold">Editorias</h4>
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-heading text-lg font-bold">Institucional</h4>
            <ul className="mt-3 space-y-1.5">
              <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Sobre Nós</a></li>
              <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Equipa Editorial</a></li>
              <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Política de Privacidade</a></li>
              <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Termos de Uso</a></li>
              <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs opacity-60">
          © 2026 O Catarinão — Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
