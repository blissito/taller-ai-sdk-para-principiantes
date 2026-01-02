import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

type MemeMode = "photo" | "text";

function App() {
  const [mode, setMode] = useState<MemeMode>("text");
  const [prompt, setPrompt] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
      // Extraer solo el base64 sin el prefijo data:image/...
      const base64 = result.split(",")[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // Generar meme desde foto
  const handleGenerateFromPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!photoBase64 || !prompt) return;

    setIsLoading(true);
    setError(null);
    setMemeImage(null);

    try {
      const response = await fetch("/api/meme/from-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoBase64,
          context: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el meme");
      }

      setDescription(data.description);
      setMemeImage(data.memeImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  // Generar meme desde texto
  const handleGenerateFromText = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    setMemeImage(null);

    try {
      const response = await fetch("/api/meme/from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el meme");
      }

      setMemeImage(data.memeImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar todo
  const handleReset = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setDescription(null);
    setMemeImage(null);
    setPrompt("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <article className="min-h-svh bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="p-8 text-center">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          Meme Generator
        </h1>
        <p className="text-xl text-gray-300">
          Convierte fotos en memes con AI SDK 6
        </p>
      </header>

      {/* Mode Selector */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setMode("text");
            handleReset();
          }}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            mode === "text"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-pink-500/30"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Solo Texto
        </button>
        <button
          onClick={() => {
            setMode("photo");
            handleReset();
          }}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            mode === "photo"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-pink-500/30"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Desde Foto
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              {mode === "photo" ? "1. Sube una foto" : "Describe tu meme"}
            </h2>

            {mode === "photo" && (
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:border-pink-500 hover:bg-white/5 transition-all"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-400">
                        Click para subir una foto
                      </span>
                    </>
                  )}
                </label>
              </div>
            )}

            {mode === "photo" && photoPreview && (
              <h2 className="text-2xl font-bold mb-4">
                2. Escribe el contexto del meme
              </h2>
            )}

            <form
              onSubmit={
                mode === "photo"
                  ? handleGenerateFromPhoto
                  : handleGenerateFromText
              }
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "photo"
                    ? "Ej: Cuando llegas tarde al trabajo..."
                    : "Ej: Un gato programador frustrado mirando errores de TypeScript"
                }
                className="w-full h-32 bg-white/5 border border-white/20 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
              />

              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  disabled={
                    isLoading || !prompt || (mode === "photo" && !photoBase64)
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generando...
                    </span>
                  ) : (
                    "Generar Meme"
                  )}
                </button>

                {(memeImage || photoPreview) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200">
                {error}
              </div>
            )}

            {description && (
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-2xl">
                <h3 className="font-bold mb-2">Descripcion detectada:</h3>
                <p className="text-sm text-gray-300">{description}</p>
              </div>
            )}
          </section>

          {/* Output Section */}
          <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Tu Meme</h2>

            <div className="flex items-center justify-center w-full min-h-[400px] bg-white/5 rounded-2xl overflow-hidden">
              {memeImage ? (
                <img
                  src={`data:image/png;base64,${memeImage}`}
                  alt="Generated meme"
                  className="max-w-full max-h-[500px] object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <svg
                    className="w-24 h-24 mx-auto mb-4 opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>Tu meme aparecera aqui</p>
                </div>
              )}
            </div>

            {memeImage && (
              <a
                href={`data:image/png;base64,${memeImage}`}
                download="meme.png"
                className="block w-full mt-4 py-3 text-center bg-green-500 hover:bg-green-600 rounded-2xl font-bold transition-all"
              >
                Descargar Meme
              </a>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <p>
            Creado con{" "}
            <a
              href="https://ai-sdk.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              AI SDK 6
            </a>{" "}
            +{" "}
            <a
              href="https://openai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              OpenAI gpt-image-1
            </a>
          </p>
        </footer>
      </main>
    </article>
  );
}

export default App;
