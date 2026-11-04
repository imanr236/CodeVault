import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Snippet = {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "codevault.snippets.v1";
const languages = ["JavaScript", "TypeScript", "Python", "HTML", "CSS", "JSON", "Bash", "SQL", "Other"];

const starterSnippets: Snippet[] = [
  {
    id: "starter-js",
    title: "Remove duplicates from an array",
    language: "JavaScript",
    description: "Create a new array containing only unique values.",
    code: "const unique = (items) => [...new Set(items)];\n\nconsole.log(unique([1, 2, 2, 3])); // [1, 2, 3]",
    tags: ["array", "utility"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "starter-python",
    title: "Read a JSON file",
    language: "Python",
    description: "Load JSON data from a local file.",
    code: "import json\n\nwith open(\"data.json\", encoding=\"utf-8\") as file:\n    data = json.load(file)\n\nprint(data)",
    tags: ["json", "files"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "starter-css",
    title: "Center an element",
    language: "CSS",
    description: "A small grid utility for centering content.",
    code: ".center {\n  display: grid;\n  place-items: center;\n}",
    tags: ["layout", "css"],
    updatedAt: new Date().toISOString(),
  },
];

function loadSnippets(): Snippet[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Snippet[];
  } catch {
    // Ignore invalid local data and fall back to examples.
  }
  return starterSnippets;
}

function App() {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All languages");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(starterSnippets[0].id);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ title: "", language: "JavaScript", description: "", code: "", tags: "" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  }, [snippets]);

  const allTags = useMemo(
    () => ["All", ...Array.from(new Set(snippets.flatMap((item) => item.tags))).sort()],
    [snippets]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return snippets.filter((item) => {
      const matchesQuery = !needle || [item.title, item.description, item.code, item.language, ...item.tags]
        .join(" ").toLowerCase().includes(needle);
      const matchesLanguage = languageFilter === "All languages" || item.language === languageFilter;
      const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
      return matchesQuery && matchesLanguage && matchesTag;
    }).sort((a, b) => {
      if (sortOrder === "oldest") return a.updatedAt.localeCompare(b.updatedAt);
      if (sortOrder === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [snippets, query, languageFilter, activeTag, sortOrder]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  function openNew() {
    setEditingId(null);
    setForm({ title: "", language: "JavaScript", description: "", code: "", tags: "" });
    setIsEditorOpen(true);
  }

  function openEdit(item: Snippet) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      language: item.language,
      description: item.description,
      code: item.code,
      tags: item.tags.join(", "),
    });
    setIsEditorOpen(true);
  }

  function saveSnippet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const next: Snippet = {
      id: editingId ?? crypto.randomUUID(),
      title: form.title.trim(),
      language: form.language,
      description: form.description.trim(),
      code: form.code,
      tags: Array.from(new Set(form.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))),
      updatedAt: now,
    };
    setSnippets((current) => editingId
      ? current.map((item) => item.id === editingId ? next : item)
      : [next, ...current]);
    setSelectedId(next.id);
    setIsEditorOpen(false);
  }

  function deleteSnippet(id: string) {
    if (!window.confirm("Delete this snippet? This only removes it from this browser.")) return;
    const remaining = snippets.filter((item) => item.id !== id);
    setSnippets(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  }

  async function copyCode() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      window.alert("Clipboard access was blocked by your browser. Select and copy the code manually.");
    }
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(snippets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codevault-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Invalid backup");

        const usedIds = new Set<string>();
        const normalized: Snippet[] = parsed.map((item: unknown) => {
          if (!item || typeof item !== "object") throw new Error("Invalid snippet");
          const record = item as Record<string, unknown>;
          if (
            typeof record.title !== "string" ||
            typeof record.code !== "string" ||
            typeof record.language !== "string" ||
            !Array.isArray(record.tags) ||
            !record.tags.every((tag): tag is string => typeof tag === "string")
          ) throw new Error("Invalid snippet");

          const candidateId = typeof record.id === "string" && record.id.trim()
            ? record.id.trim()
            : crypto.randomUUID();
          const id = usedIds.has(candidateId) ? crypto.randomUUID() : candidateId;
          usedIds.add(id);

          const parsedDate = typeof record.updatedAt === "string" && !Number.isNaN(Date.parse(record.updatedAt))
            ? record.updatedAt
            : new Date().toISOString();

          return {
            id,
            title: record.title,
            language: record.language,
            code: record.code,
            description: typeof record.description === "string" ? record.description : "",
            tags: Array.from(new Set(record.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))),
            updatedAt: parsedDate,
          };
        });

        setSnippets(normalized);
        setSelectedId(normalized[0]?.id ?? null);
        setQuery("");
        setLanguageFilter("All languages");
        setActiveTag("All");
      } catch {
        window.alert("That file doesn't look like a valid CodeVault JSON backup.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="CodeVault home">
          <span className="brand-mark">⌘</span>
          <span>code<span className="brand-accent">vault</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><span>▦</span> All snippets <span className="nav-count">{snippets.length}</span></button>
        <div className="sidebar-section">
          <div className="sidebar-heading">COLLECTIONS</div>
          {allTags.slice(1).length ? allTags.slice(1).map((tag) => (
            <button key={tag} className={activeTag === tag ? "tag-nav selected" : "tag-nav"} onClick={() => setActiveTag(activeTag === tag ? "All" : tag)}>
              <span className="tag-dot" /> {tag}
            </button>
          )) : <p className="muted small sidebar-hint">Tags you add will appear here.</p>}
        </div>
        <div className="sidebar-bottom">
          <div className="local-note"><span className="status-dot" /> Stored locally in this browser</div>
          <div className="sidebar-foot">CODEVAULT <span>v0.1.0</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>All snippets</strong></div>
          <div className="top-actions">
            <label className="text-action import-action">Import <input type="file" accept="application/json,.json" onChange={importBackup} /></label>
            <button className="text-action" onClick={exportBackup}>Export backup ↓</button>
            <button className="primary-button" onClick={openNew}><span>＋</span> New snippet</button>
          </div>
        </header>

        <section className="content">
          <div className="page-intro">
            <div>
              <div className="eyebrow">YOUR PERSONAL LIBRARY</div>
              <h1>Code snippets<span className="title-period">.</span></h1>
              <p className="muted">Save the little pieces of code worth keeping.</p>
            </div>
            <div className="snippet-total"><strong>{snippets.length.toString().padStart(2, "0")}</strong><span>SNIPPETS SAVED</span></div>
          </div>

          <div className="toolbar">
            <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search snippets, tags, or code..." /></div>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} aria-label="Filter by language">
              <option>All languages</option>
              {languages.map((language) => <option key={language}>{language}</option>)}
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort snippets">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          <div className="library-layout">
            <section className="snippet-list">
              <div className="list-heading"><span>LIBRARY <b>{filtered.length}</b></span><button onClick={() => { setQuery(""); setLanguageFilter("All languages"); setActiveTag("All"); }}>Reset filters</button></div>
              {filtered.length ? filtered.map((item) => (
                <button key={item.id} className={selected?.id === item.id ? "snippet-card chosen" : "snippet-card"} onClick={() => setSelectedId(item.id)}>
                  <div className="snippet-card-top"><span className="language-pill">{item.language}</span><span className="card-dots">···</span></div>
                  <strong>{item.title}</strong>
                  <p>{item.description || "No description added."}</p>
                  <div className="snippet-card-bottom"><span>{item.tags.slice(0, 2).map((tag) => <i key={tag}>#{tag}</i>)}</span><time>{new Date(item.updatedAt).toLocaleDateString()}</time></div>
                </button>
              )) : <div className="empty-state"><span>⌕</span><strong>No snippets found</strong><p>Try another search or clear your filters.</p><button onClick={() => { setQuery(""); setLanguageFilter("All languages"); setActiveTag("All"); }}>Clear filters</button></div>}
            </section>

            <section className="detail-panel">
              {selected ? <>
                <div className="detail-header">
                  <div><span className="language-pill">{selected.language}</span><div className="detail-date">UPDATED {new Date(selected.updatedAt).toLocaleDateString()}</div></div>
                  <div className="detail-actions"><button className="icon-button" title="Edit snippet" onClick={() => openEdit(selected)}>✎</button><button className="icon-button danger" title="Delete snippet" onClick={() => deleteSnippet(selected.id)}>⌫</button></div>
                </div>
                <h2>{selected.title}</h2>
                <p className="detail-description">{selected.description || "No description added."}</p>
                <div className="code-toolbar"><span><i /> SOURCE CODE</span><button onClick={copyCode}>{copied ? "✓ Copied" : "▢ Copy code"}</button></div>
                <pre className="code-block"><code>{selected.code}</code></pre>
                <div className="detail-meta"><span>TAGGED IN</span><div>{selected.tags.length ? selected.tags.map((tag) => <button key={tag} onClick={() => setActiveTag(tag)}>#{tag}</button>) : <em>No tags</em>}</div></div>
                <div className="privacy-callout"><span>◈</span><p><strong>Your code stays yours.</strong> Snippets are saved in this browser only. They are not uploaded to a server.</p></div>
              </> : <div className="empty-detail"><span>⌘</span><strong>Select a snippet</strong><p>Choose an item from your library or create a new one.</p><button className="primary-button" onClick={openNew}>＋ New snippet</button></div>}
            </section>
          </div>
          <footer className="page-footer"><span>MADE FOR BUILDERS, ONE SNIPPET AT A TIME.</span><span>LOCAL-FIRST STORAGE <i /></span></footer>
        </section>
      </main>

      {isEditorOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsEditorOpen(false); }}>
        <form className="editor-modal" onSubmit={saveSnippet}>
          <div className="modal-heading"><div><span className="eyebrow">{editingId ? "UPDATE YOUR LIBRARY" : "GROW YOUR LIBRARY"}</span><h2>{editingId ? "Edit snippet" : "New snippet"}</h2></div><button type="button" className="icon-button" onClick={() => setIsEditorOpen(false)}>✕</button></div>
          <label>Title<input required maxLength={90} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Format a date" /></label>
          <div className="form-row"><label>Language<select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>{languages.map((language) => <option key={language}>{language}</option>)}</select></label><label>Tags <span className="muted">(comma separated)</span><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="utility, dates" /></label></div>
          <label>Description<input maxLength={180} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this snippet do?" /></label>
          <label>Code<textarea required rows={9} spellCheck={false} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Paste your code here..." /></label>
          <div className="modal-footer"><span>Saved only in this browser</span><button type="button" className="secondary-button" onClick={() => setIsEditorOpen(false)}>Cancel</button><button className="primary-button" type="submit">Save snippet</button></div>
        </form>
      </div>}
    </div>
  );
}

export default App;