import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/magazineArticles';

export function ArticleCard({ article, priority = false }) {
  return (
    <Link
      href={`/magazin/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl transition"
      style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}
    >
      <div className="relative h-44 w-full overflow-hidden" style={{ background: 'var(--color-primary-soft)' }}>
        {article.heroImage ? (
          <Image
            src={article.heroImage}
            alt={article.heroImageAlt || article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            priority={priority}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            <CategoryEmoji slug={article.category} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{labelForCategory(article.category)}</div>
        <h3 className="mt-2 text-[17px] font-semibold leading-snug" style={{ color: 'var(--color-navy)' }}>{article.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[14px]" style={{ color: 'var(--color-text-muted)' }}>{article.lead}</p>
        <div className="mt-4 flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readingMinutes} Min.</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryEmoji({ slug }) {
  const map = {
    vorsorge: '🛡️',
    'herz-kreislauf': '❤️',
    orthopaedie: '🦴',
    psyche: '🧠',
    kinder: '🧸',
    hno: '👂',
    'magen-darm': '🫀',
    haut: '☀️',
    allgemein: '📋',
  };
  return <span aria-hidden>{map[slug] || '📖'}</span>;
}

export function labelForCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}
