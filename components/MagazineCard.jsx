import Link from 'next/link';
import { Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/magazineArticles';

export function ArticleCard({ article }) {
  return (
    <Link href={`/magazin/${article.slug}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`flex h-32 items-center justify-center rounded-xl bg-gradient-to-br ${article.heroGradient} text-5xl`}>
        <CategoryEmoji slug={article.category} />
      </div>
      <div className="mt-4 flex-1">
        <div className="text-xs font-medium text-sky-700">{labelForCategory(article.category)}</div>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-sky-700">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{article.lead}</p>
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readingMinutes} Min.</span>
        <span>{formatDate(article.publishedAt)}</span>
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
