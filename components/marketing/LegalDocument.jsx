// components/marketing/LegalDocument.jsx
// Server component — renders a structured array of content blocks so each
// legal page doesn't need hundreds of hand-nested <p>/<h2> tags inline.

export default function LegalDocument({ title, subtitle, sections }) {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-sand bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <a href="/" className="font-display text-xl italic text-ink">SiMenu</a>
          <a href="/" className="text-sm font-semibold text-ink/60 hover:text-ink">← Back home</a>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl italic text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink/50">{subtitle}</p>}

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <section key={index}>
              {section.heading && <h2 className="font-display text-lg font-semibold text-ink">{section.heading}</h2>}
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-ink/70">{p}</p>
              ))}
              {section.list && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/70">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-sand text-left text-xs uppercase tracking-wide text-ink/40">
                        {section.table.headers.map((h) => (
                          <th key={h} className="py-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, i) => (
                        <tr key={i} className="border-b border-sand/60">
                          {row.map((cell, j) => (
                            <td key={j} className="py-2 pr-4 text-ink/70">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
