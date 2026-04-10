import { Link } from "react-router-dom";

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  is_featured: boolean;
  views_count: number;
  category_name?: string | null;
  category_slug?: string | null;
  category_color?: string | null;
  author_name?: string | null;
}

interface NewsCardProps {
  article: PublicArticle;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const placeholderImage =
  "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80";

const NewsCard = ({
  article,
  variant = "default",
  className = "",
}: NewsCardProps) => {
  const imageUrl = article.cover_image_url || placeholderImage;
  const articleUrl = `/noticia/${article.slug}`;

  if (variant === "hero") {
    return (
      <Link to={articleUrl}>
        <article
          className={`group relative overflow-hidden rounded-lg bg-card news-card-hover cursor-pointer h-full ${className}`}
        >
          <div className="relative h-full min-h-[300px] overflow-hidden">
            <img
              src={imageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {article.category_name && (
                <span
                  className="category-badge mb-3"
                  style={
                    article.category_color
                      ? { backgroundColor: article.category_color }
                      : undefined
                  }
                >
                  {article.category_name}
                </span>
              )}
              <h2 className="font-heading text-2xl font-bold leading-tight text-white md:text-3xl">
                {article.title}
              </h2>
              {article.summary && (
                <p className="mt-2 font-body text-sm text-white/80 line-clamp-2">
                  {article.summary}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                {article.author_name && <span>{article.author_name}</span>}
                {article.author_name && article.published_at && (
                  <span>•</span>
                )}
                {article.published_at && (
                  <span>{formatDate(article.published_at)}</span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={articleUrl}>
        <article className="group flex gap-3 cursor-pointer py-3 border-b border-border last:border-0">
          <img
            src={imageUrl}
            alt={article.title}
            className="h-16 w-20 flex-shrink-0 rounded object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            {article.category_name && (
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: article.category_color ?? undefined }}
              >
                {article.category_name}
              </span>
            )}
            <h4 className="font-heading text-sm font-bold leading-snug text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
              {article.title}
            </h4>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={articleUrl}>
      <article
        className={`group overflow-hidden rounded-lg bg-card shadow-sm news-card-hover cursor-pointer flex flex-col ${className}`}
      >
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          {article.category_name && (
            <span
              className="category-badge"
              style={
                article.category_color
                  ? { backgroundColor: article.category_color }
                  : undefined
              }
            >
              {article.category_name}
            </span>
          )}
          <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="mt-1.5 font-body text-sm text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            {article.author_name && <span>{article.author_name}</span>}
            {article.author_name && article.published_at && <span>•</span>}
            {article.published_at && (
              <span>{formatDate(article.published_at)}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
