'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ value, label = 'Kopieren', className = '' }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback: prompt
      window.prompt('Kopieren mit Strg+C:', value);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? 'Kopiert' : label}
      className={`inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? 'Kopiert' : label}</span>
    </button>
  );
}
