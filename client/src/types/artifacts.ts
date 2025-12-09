export type ArtifactType = "code" | "tool-result" | "markdown" | "error";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string; // Para code blocks: 'typescript', 'python', etc.
  messageId: string; // Vínculo al mensaje que generó este artefacto
  createdAt: Date;
}

export interface ArtifactState {
  artifacts: Artifact[];
  selectedId: string | null; // Artefacto actualmente visible
  autoSync: boolean; // true = sigue al último automáticamente
}

// Part de Generative UI que el agente puede enviar
export interface ArtifactPart {
  type: "artifact";
  artifact: {
    type: ArtifactType;
    title: string;
    content: string;
    language?: string;
  };
}
