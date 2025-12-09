import { Streamdown } from "streamdown";
import type { Artifact } from "../../types/artifacts";

interface MarkdownArtifactProps {
  artifact: Artifact;
}

export function MarkdownArtifact({ artifact }: MarkdownArtifactProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-purple-800 text-purple-100 text-sm">
        <span className="font-medium">Markdown</span>
      </div>

      {/* Contenido renderizado */}
      <div className="flex-1 overflow-auto bg-white p-4">
        <Streamdown>{artifact.content}</Streamdown>
      </div>
    </div>
  );
}
