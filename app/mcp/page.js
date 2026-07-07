import Link from 'next/link';
import { Bot, Terminal, ExternalLink, Copy, Zap, ShieldCheck, Info } from 'lucide-react';
import { toolsPublicShape } from '@/lib/mcp/tools';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: 'MCP-Server – Navoria für KI-Agenten',
  description: 'Navoria stellt einen Model-Context-Protocol-Server bereit. KI-Agenten können strukturierte Tools nutzen, um Ärzt:innen zu suchen, Fachrichtungen für Symptome zu empfehlen und Ratgeber-Inhalte abzurufen.',
  alternates: { canonical: '/mcp' },
  robots: { index: true, follow: true },
};

const h2 = 'mt-10 text-2xl font-semibold text-slate-900';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const code = 'block overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-[13px] font-mono text-slate-800';

export default function MCPPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const tools = toolsPublicShape();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">MCP</span>
      </nav>

      <header>
        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <Bot aria-hidden="true" className="h-3 w-3" /> Für KI-Agenten
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Navoria Model Context Protocol (MCP)
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
          Navoria stellt einen offenen <strong>MCP-Server</strong> bereit. KI-Assistenten wie Claude Desktop, Cursor, ChatGPT-Agent oder eigene LLM-Anwendungen können strukturiert nach Ärzt:innen in Deutschland suchen, Fachrichtungs-Empfehlungen einholen und deutsche Notfall-Informationen abrufen – ohne HTML-Scraping.
        </p>
      </header>

      {/* Endpoint-Box */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Terminal aria-hidden="true" className="h-5 w-5 text-sky-600" />
            Endpoint
          </h2>
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-mono text-white">
            {base}/api/mcp
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Transport</dt>
            <dd className="mt-0.5 font-medium text-slate-900">HTTP + JSON-RPC 2.0</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Protokoll-Version</dt>
            <dd className="mt-0.5 font-medium text-slate-900">2025-06-18</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Authentifizierung</dt>
            <dd className="mt-0.5 font-medium text-slate-900">Keine (Read-only, öffentlich)</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Rate-Limit</dt>
            <dd className="mt-0.5 font-medium text-slate-900">Fair Use – bei Missbrauch IP-Sperre</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Discovery</dt>
            <dd className="mt-0.5 font-mono text-xs text-slate-800">/.well-known/mcp.json</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Anzahl Tools</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{tools.length}</dd>
          </div>
        </dl>
      </section>

      {/* Quickstart */}
      <section>
        <h2 className={h2}>Quickstart – Tool aufrufen</h2>
        <p className={p}>Beispiel: Zahnärzt:innen in Berlin suchen.</p>
        <pre className={code}>{`curl -s ${base}/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_doctors",
      "arguments": { "specialty": "Zahnarzt", "city": "Berlin", "limit": 5 }
    }
  }' | jq`}</pre>

        <h3 className="mt-6 text-lg font-semibold text-slate-900">Tools auflisten</h3>
        <pre className={code}>{`curl -s ${base}/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq`}</pre>
      </section>

      {/* Claude Desktop / Cursor Config */}
      <section>
        <h2 className={h2}>Integration in Claude Desktop</h2>
        <p className={p}>
          Fügen Sie in <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) bzw. dem entsprechenden Pfad unter Windows/Linux ein:
        </p>
        <pre className={code}>{`{
  "mcpServers": {
    "navoria": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${base}/api/mcp"]
    }
  }
}`}</pre>
        <p className="mt-3 text-sm text-slate-600">
          Nach Neustart von Claude Desktop stehen Navoria-Tools zur Verfügung. Nutzen Sie <code>@navoria</code> in einer Konversation.
        </p>
      </section>

      {/* Tool list */}
      <section>
        <h2 className={h2}>Verfügbare Tools</h2>
        <div className="mt-4 space-y-3">
          {tools.map((t) => (
            <details key={t.name} className="group rounded-xl border border-slate-200 bg-white p-5 open:border-sky-200 open:bg-sky-50/30">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Zap aria-hidden="true" className="h-4 w-4 text-sky-600" />
                    <code className="text-sm font-semibold text-slate-900">{t.name}</code>
                  </div>
                  <span className="text-xs text-slate-500 group-open:hidden">↓ Details</span>
                </div>
                <p className="mt-1.5 pl-6 text-sm text-slate-700">{t.title}</p>
              </summary>
              <p className="mt-3 pl-6 text-sm leading-relaxed text-slate-700">{t.description}</p>
              <div className="mt-3 pl-6">
                <div className="text-xs uppercase tracking-wide text-slate-500">Input-Schema</div>
                <pre className="mt-1 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px] font-mono text-slate-800">{JSON.stringify(t.inputSchema, null, 2)}</pre>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* WebMCP */}
      <section>
        <h2 className={h2}>WebMCP (Browser-Agenten)</h2>
        <p className={p}>
          Zusätzlich registrieren wir die Tools clientseitig via <code>navigator.modelContext</code> (WebMCP-Draft, Chrome 146+ Canary, allgemeine Verfügbarkeit ab H2/2026). Browser-basierte KI-Agenten sehen die Navoria-Tools automatisch, sobald ein Nutzer navoria.de besucht.
        </p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-600">
          <Info aria-hidden="true" className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5" />
          Feature-Detection ist aktiv – auf Browsern ohne WebMCP-Support werden keine Tools registriert (kein Fehler, keine Console-Warnung).
        </div>
      </section>

      {/* Terms */}
      <section>
        <h2 className={h2}>Nutzungsbedingungen</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
          <li><strong>Read-Only:</strong> Es werden ausschließlich Lese-Operationen angeboten. Schreibende Aktionen (Korrektur einreichen, Profil beanspruchen) sind bewusst nicht als Tool exponiert.</li>
          <li><strong>Attribution empfohlen:</strong> Wenn Ihr Agent Navoria-Daten in Antworten verwendet, geben Sie bitte die Quelle an – z. B. „Quelle: navoria.de".</li>
          <li><strong>Kein Ärzterating:</strong> Sternebewertungen stammen aus Google-Business-Profil und dienen nur der Übersicht, nicht der Bewertung ärztlicher Qualität.</li>
          <li><strong>Kein Ersatz für ärztlichen Rat:</strong> Empfehlungen aus <code>find_specialty_for_symptom</code> sind keine medizinische Diagnose.</li>
          <li><strong>Notfälle:</strong> Bei akuten Beschwerden immer 112 wählen. <code>get_emergency_info</code> darf niemals einen tatsächlichen Notruf ersetzen.</li>
        </ul>
      </section>

      {/* Kontakt */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Feedback und Kontakt</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Sie bauen einen KI-Agenten mit Navoria-Integration? Wir freuen uns über Ihre Rückmeldung – Bugs, Wunsch-Tools, Rate-Limits abstimmen: <a href="mailto:mail@navoria.de" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">mail@navoria.de</a>.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Weitere Ressourcen: <Link href="/llms.txt" className="text-sky-700 underline">llms.txt</Link> · <a href={`${base}/mcp.json`} target="_blank" rel="noreferrer" className="text-sky-700 underline">mcp.json <ExternalLink aria-hidden="true" className="ml-0.5 inline h-3 w-3" /></a> · <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-sky-700 underline">MCP-Spec <ExternalLink aria-hidden="true" className="ml-0.5 inline h-3 w-3" /></a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
