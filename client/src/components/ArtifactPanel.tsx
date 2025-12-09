import type { Artifact } from "../types/artifacts";
import { CodeArtifact } from "./artifacts/CodeArtifact";
import { ToolResultArtifact } from "./artifacts/ToolResultArtifact";
import { ErrorArtifact } from "./artifacts/ErrorArtifact";
import { MarkdownArtifact } from "./artifacts/MarkdownArtifact";

interface ArtifactPanelProps {
  artifact: Artifact | null;
  autoSync: boolean;
  currentIndex: number;
  totalArtifacts: number;
  onClose: () => void;
  onEnableAutoSync: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function ArtifactPanel({
  artifact,
  autoSync,
  currentIndex,
  totalArtifacts,
  onClose,
  onEnableAutoSync,
  onPrevious,
  onNext,
}: ArtifactPanelProps) {
  // Renderizar el artefacto según su tipo
  const renderArtifact = () => {
    if (!artifact) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>Sin artefactos</p>
        </div>
      );
    }

    switch (artifact.type) {
      case "code":
        return <CodeArtifact artifact={artifact} />;
      case "tool-result":
        return <ToolResultArtifact artifact={artifact} />;
      case "error":
        return <ErrorArtifact artifact={artifact} />;
      case "markdown":
        return <MarkdownArtifact artifact={artifact} />;
      default:
        return (
          <div className="flex-1 p-4">
            <pre className="text-sm">{artifact.content}</pre>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-gray-800 truncate max-w-[200px]">
            {artifact?.title || "Artefacto"}
          </h2>
          {!autoSync && (
            <button
              onClick={onEnableAutoSync}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="Volver a sincronizar con el último artefacto"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Cerrar panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Contenido del artefacto */}
      <div className="flex-1 overflow-hidden">
        {renderArtifact()}
      </div>

      {/* Footer con navegación */}
      {totalArtifacts > 1 && (
        <footer className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onPrevious}
            disabled={currentIndex <= 1}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="text-sm text-gray-500">
            {currentIndex} / {totalArtifacts}
          </span>

          <button
            onClick={onNext}
            disabled={currentIndex >= totalArtifacts}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </footer>
      )}
    </div>
  );
}
