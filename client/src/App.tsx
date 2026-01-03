import { useState, useEffect } from "react";

type Style = "vibrant" | "minimal" | "dramatic" | "tech";

interface Format { format: string; image: string }
interface Preview { id: string; style: Style; prompt: string; image: string; formats?: Format[] }
interface Session { id: string; title: string; previews: Preview[]; createdAt: number }

const STYLE_INFO: Record<Style, { emoji: string; label: string }> = {
  vibrant: { emoji: "🎨", label: "Vibrante" },
  minimal: { emoji: "✨", label: "Mínimo" },
  dramatic: { emoji: "🎬", label: "Dramático" },
  tech: { emoji: "🚀", label: "Tech" },
};

const STORAGE_KEY = "thumbnail-history";

export default function App() {
  const [title, setTitle] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);

  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [loadingFormats, setLoadingFormats] = useState(false);

  const [history, setHistory] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const selected = previews.find((p) => p.id === selectedId) || null;

  // Cargar historial al inicio (con validación de formato)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Session[];
        // Filtrar solo sesiones válidas (con el formato nuevo)
        const valid = parsed.filter(
          (s) => s.id && s.title && Array.isArray(s.previews) && s.previews.length > 0
        );
        setHistory(valid);
        // Limpiar si había inválidas
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      }
    } catch {
      // Si falla el parse, limpiar localStorage
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Cerrar lightbox con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Guardar historial cuando cambia
  const saveToHistory = (session: Session) => {
    const updated = [session, ...history].slice(0, 10); // max 10
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Cargar sesión del historial
  const loadSession = (session: Session) => {
    setTitle(session.title);
    setPreviews(session.previews);
    setSelectedId(null);
    setShowHistory(false);
  };

  // Nueva sesión
  const newSession = () => {
    setTitle("");
    setPreviews([]);
    setSelectedId(null);
  };

  // PASO 1: Explorar (genera 4 previews, 1 por estilo)
  const explore = async () => {
    if (!title.trim()) return;
    setLoadingPreviews(true);
    setPreviews([]);
    setSelectedId(null);

    try {
      const res = await fetch("/api/previews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(`Error: ${data.error || "No se pudieron generar los previews"}`);
        return;
      }

      setPreviews(data.previews);

      // Guardar en historial
      saveToHistory({
        id: Date.now().toString(),
        title,
        previews: data.previews,
        createdAt: Date.now(),
      });
    } catch {
      alert("Error de conexión. Verifica que el servidor esté corriendo.");
    } finally {
      setLoadingPreviews(false);
    }
  };

  // PASO 2: Generar formatos (y cachear en el preview)
  const generate = async () => {
    if (!selected) return;

    // No regenerar si ya tiene formatos
    if (selected.formats) {
      console.log("Ya tiene formatos, no regenerar");
      return;
    }

    const targetId = selected.id; // Capturar antes de async
    setLoadingFormats(true);

    try {
      const res = await fetch("/api/formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: selected.image, prompt: selected.prompt }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(`Error: ${data.error || "No se pudieron generar los formatos"}`);
        return;
      }

      if (!data.formats?.length) {
        alert("No se generó ningún formato. Intenta de nuevo.");
        return;
      }

      // Guardar formatos en el preview correspondiente
      setPreviews((prev) =>
        prev.map((p) =>
          p.id === targetId ? { ...p, formats: data.formats } : p
        )
      );
    } catch (error) {
      alert("Error de conexión. Verifica que el servidor esté corriendo.");
    } finally {
      setLoadingFormats(false);
    }
  };

  // Download
  const download = (image: string, name: string) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${image}`;
    a.download = `${name}.png`;
    a.click();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex flex-col overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-4 flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Thumbnail Generator
            <span className="text-sm font-normal text-gray-400 ml-2">
              AI SDK 6 + OpenAI Edit
            </span>
          </h1>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial ({history.length})
            </button>
          )}
        </div>

        {/* Historial */}
        {showHistory && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-400 mb-2">Sesiones anteriores:</p>
            {history.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s)}
                className="w-full text-left px-3 py-2 bg-white/5 rounded hover:bg-white/10 transition flex items-center gap-2"
              >
                <span>🎨</span>
                <span className="flex-1 truncate">{s.title}</span>
                <span className="text-xs text-gray-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del video..."
            className="flex-1 bg-white/10 rounded px-4 py-2 outline-none focus:ring-2 ring-orange-500"
            onKeyDown={(e) => e.key === "Enter" && !previews.length && explore()}
          />
          {previews.length > 0 ? (
            <button
              onClick={newSession}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition"
            >
              Nueva
            </button>
          ) : (
            <button
              onClick={explore}
              disabled={loadingPreviews || !title.trim()}
              className="px-6 py-2 bg-orange-500 rounded font-medium disabled:opacity-50"
            >
              {loadingPreviews ? "..." : "Explorar"}
            </button>
          )}
        </div>

        {/* Loading Previews */}
        {loadingPreviews && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Generando 4 propuestas...</span>
          </div>
        )}

        {/* Contenido principal */}
        {previews.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">

            {/* VISTA: Formatos generados (principal) */}
            {selected?.formats && (
              <div className="flex-1 min-h-0 flex flex-col gap-3">
                <p className="text-sm text-gray-400 shrink-0">Formatos generados:</p>
                <div className="flex-1 min-h-0 flex gap-4 items-stretch justify-center">
                  {selected.formats.map((f) => (
                    <div key={f.format} className="flex flex-col items-center group">
                      <div className="flex-1 min-h-0 relative">
                        <img
                          src={`data:image/png;base64,${f.image}`}
                          alt={f.format}
                          className="h-full w-auto rounded-lg cursor-pointer hover:ring-2 ring-orange-500 transition object-contain"
                          onClick={() => setZoomed(f.image)}
                        />
                        <button
                          onClick={() => download(f.image, f.format)}
                          className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 capitalize">{f.format}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA: Grid grande (cuando no hay formatos) */}
            {!selected?.formats && !loadingFormats && (
              <>
                <p className="text-sm text-gray-400 shrink-0">Elige un estilo:</p>
                <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-h-0">
                  {previews.map((p) => (
                    <div key={p.id} className="relative group min-h-0">
                      <button
                        onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                        className={`w-full h-full rounded-xl overflow-hidden border-4 transition ${
                          selected?.id === p.id
                            ? "border-orange-500 ring-4 ring-orange-500/30"
                            : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <img src={`data:image/png;base64,${p.image}`} alt="" className="w-full h-full object-contain bg-black/20" />
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {STYLE_INFO[p.style].emoji} {STYLE_INFO[p.style].label}
                          {p.formats && <span className="text-green-400 ml-1">✓</span>}
                        </div>
                      </button>
                      <button
                        onClick={() => setZoomed(p.image)}
                        className="absolute top-3 right-3 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Loading Formats */}
            {loadingFormats && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-400">Generando 3 formatos...</p>
                </div>
              </div>
            )}

            {/* Mini grid (cuando hay formatos) */}
            {selected?.formats && (
              <div className="shrink-0 bg-white/5 rounded-lg p-3">
                <div className="flex gap-3 items-center justify-center">
                  {previews.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition flex flex-col items-center ${
                        selected?.id === p.id
                          ? "border-orange-500"
                          : "border-transparent hover:border-white/30"
                      }`}
                    >
                      <img
                        src={`data:image/png;base64,${p.image}`}
                        alt=""
                        className="h-14 w-14 object-cover"
                      />
                      <span className="text-[10px] text-gray-400 py-1">
                        {STYLE_INFO[p.style].emoji} {p.formats ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón generar formatos */}
            {selected && !loadingFormats && !selected.formats && (
              <button
                onClick={generate}
                className="shrink-0 w-full py-3 bg-orange-500 rounded-lg font-medium hover:bg-orange-600 transition text-lg"
              >
                Generar formatos de {STYLE_INFO[selected.style].emoji} {STYLE_INFO[selected.style].label} →
              </button>
            )}
          </div>
        )}

        {/* Zoom Modal */}
        {zoomed && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
            onClick={() => setZoomed(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={() => setZoomed(null)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={`data:image/png;base64,${zoomed}`}
                alt=""
                className="max-w-full max-h-[80vh] rounded-lg"
              />
              <button
                onClick={() => download(zoomed, "propuesta")}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
