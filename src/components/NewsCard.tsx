import type { NewsArticle } from "@/data/mockNews";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

const NewsCard = ({ article, variant = "default", className = "" }: NewsCardProps) => {
  if (variant === "hero") {
    return (
      <article className="group relative overflow-hidden rounded-lg bg-card news-card-hover cursor-pointer">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="category-badge mb-3">{article.category}</span>
            <h2 className="font-heading text-2xl font-bold leading-tight text-white md:text-3xl">
              {article.title}
            </h2>
            <p className="mt-2 font-body text-sm text-white/80 line-clamp-2">
              {article.summary}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
              <span>{article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3 cursor-pointer py-3 border-b border-border last:border-0">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-16 w-20 flex-shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            {article.category}
          </span>
          <h4 className="font-heading text-sm font-bold leading-snug text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </article>
    );
  }

  return (
    <article className={`group overflow-hidden rounded-lg bg-card shadow-sm news-card-hover cursor-pointer flex flex-col ${className}`}>
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <span className="category-badge">{article.category}</span>
        <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1.5 font-body text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
