import type { Artifact } from "../../types/artifacts";

interface ToolResultArtifactProps {
  artifact: Artifact;
}

export function ToolResultArtifact({ artifact }: ToolResultArtifactProps) {
  // Intentar parsear como JSON para formato bonito
  let formattedContent: string;
  let isJson = false;

  try {
    const parsed = JSON.parse(artifact.content);
    formattedContent = JSON.stringify(parsed, null, 2);
    isJson = true;
  } catch {
    formattedContent = artifact.content;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con tipo */}
      <div className="flex items-center justify-between px-4 py-2 bg-green-800 text-green-100 text-sm">
        <span className="font-medium">Tool Result</span>
        {isJson && (
          <span className="px-2 py-0.5 bg-green-700 rounded text-xs">JSON</span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <pre className="p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
          {formattedContent}
        </pre>
      </div>
    </div>
  );
}
