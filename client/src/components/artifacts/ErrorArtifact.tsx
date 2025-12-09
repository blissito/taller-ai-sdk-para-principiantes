import type { Artifact } from "../../types/artifacts";

interface ErrorArtifactProps {
  artifact: Artifact;
}

export function ErrorArtifact({ artifact }: ErrorArtifactProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header de error */}
      <div className="flex items-center gap-2 px-4 py-2 bg-red-800 text-red-100 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-medium">Error</span>
      </div>

      {/* Contenido del error */}
      <div className="flex-1 overflow-auto bg-red-50">
        <pre className="p-4 text-sm font-mono text-red-800 whitespace-pre-wrap break-words">
          {artifact.content}
        </pre>
      </div>
    </div>
  );
}
