export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  author: string;
  date: string;
  slug: string;
  featured?: boolean;
}

export const categories = [
  "Política", "Economia", "Saúde", "Cultura", "Esportes", "Educação", "Segurança", "Tecnologia"
];

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Governo de SC anuncia novo pacote de investimentos em infraestrutura para 2026",
    summary: "O governador apresentou nesta terça-feira um plano ambicioso de R$ 2,5 bilhões para modernizar rodovias, portos e aeroportos do estado catarinense.",
    category: "Política",
    imageUrl: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f3?w=800&q=80",
    author: "Maria Silva",
    date: "08 Abr 2026",
    slug: "governo-sc-investimentos-infraestrutura",
    featured: true,
  },
  {
    id: "2",
    title: "Florianópolis lidera ranking de qualidade de vida entre capitais brasileiras",
    summary: "Estudo nacional coloca a capital catarinense no topo do índice de desenvolvimento humano municipal pela terceira vez consecutiva.",
    category: "Economia",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    author: "João Pereira",
    date: "07 Abr 2026",
    slug: "florianopolis-qualidade-vida",
  },
  {
    id: "3",
    title: "Festival de Dança de Joinville bate recorde de inscrições para edição 2026",
    summary: "Mais de 6.000 bailarinos de 20 países confirmaram participação no maior festival de dança do mundo.",
    category: "Cultura",
    imageUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80",
    author: "Ana Costa",
    date: "07 Abr 2026",
    slug: "festival-danca-joinville-recorde",
  },
  {
    id: "4",
    title: "Novo hospital regional será inaugurado em Chapecó no próximo mês",
    summary: "Unidade terá 200 leitos e centro cirúrgico de última geração para atender toda a região oeste.",
    category: "Saúde",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    author: "Carlos Mendes",
    date: "06 Abr 2026",
    slug: "hospital-regional-chapeco",
  },
  {
    id: "5",
    title: "Avaí e Figueirense se preparam para clássico decisivo no Campeonato Catarinense",
    summary: "Equipes de Florianópolis entram em campo neste sábado em partida que pode definir o rumo do campeonato estadual.",
    category: "Esportes",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    author: "Pedro Souza",
    date: "06 Abr 2026",
    slug: "classico-avai-figueirense",
  },
  {
    id: "6",
    title: "Startup de Blumenau desenvolve tecnologia inovadora para agricultura sustentável",
    summary: "A empresa criou sensores inteligentes que reduzem o uso de água em até 40% nas plantações do Vale do Itajaí.",
    category: "Tecnologia",
    imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    author: "Lucia Fernandes",
    date: "05 Abr 2026",
    slug: "startup-blumenau-agricultura",
  },
  {
    id: "7",
    title: "Universidades catarinenses ampliam oferta de cursos gratuitos de capacitação",
    summary: "UFSC, UDESC e IFSC lançam programa conjunto com mais de 5.000 vagas em cursos de extensão para a comunidade.",
    category: "Educação",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80",
    author: "Roberto Lima",
    date: "05 Abr 2026",
    slug: "universidades-cursos-gratuitos",
  },
  {
    id: "8",
    title: "Operação policial desarticula quadrilha de furto de veículos na Grande Florianópolis",
    summary: "Ação conjunta das polícias Civil e Militar resultou em 12 prisões e na recuperação de 25 veículos roubados.",
    category: "Segurança",
    imageUrl: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&q=80",
    author: "Marcos Oliveira",
    date: "04 Abr 2026",
    slug: "operacao-policial-florianopolis",
  },
];
