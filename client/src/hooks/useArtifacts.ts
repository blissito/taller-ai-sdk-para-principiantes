import { useState, useCallback } from "react";
import type { Artifact, ArtifactState } from "../types/artifacts";

const initialState: ArtifactState = {
  artifacts: [],
  selectedId: null,
  autoSync: true,
};

export function useArtifacts() {
  const [state, setState] = useState<ArtifactState>(initialState);

  // Agregar artefacto (llamado cuando llega un mensaje con artefacto)
  const addArtifact = useCallback((artifact: Artifact) => {
    setState((prev) => {
      // Evitar duplicados
      if (prev.artifacts.some((a) => a.id === artifact.id)) {
        return prev;
      }

      const newArtifacts = [...prev.artifacts, artifact];

      return {
        ...prev,
        artifacts: newArtifacts,
        // Si autoSync está activo, seleccionar el nuevo artefacto
        selectedId: prev.autoSync ? artifact.id : prev.selectedId,
      };
    });
  }, []);

  // Seleccionar artefacto manualmente (desactiva autoSync)
  const selectArtifact = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedId: id,
      autoSync: false, // Usuario tomó control manual
    }));
  }, []);

  // Volver a modo autoSync (selecciona el último artefacto)
  const enableAutoSync = useCallback(() => {
    setState((prev) => {
      const lastArtifact = prev.artifacts[prev.artifacts.length - 1];
      return {
        ...prev,
        autoSync: true,
        selectedId: lastArtifact?.id ?? null,
      };
    });
  }, []);

  // Obtener artefacto por ID de mensaje
  const getArtifactForMessage = useCallback(
    (messageId: string): Artifact | undefined => {
      return state.artifacts.find((a) => a.messageId === messageId);
    },
    [state.artifacts]
  );

  // Obtener artefacto seleccionado
  const selectedArtifact = state.selectedId
    ? state.artifacts.find((a) => a.id === state.selectedId)
    : null;

  // Navegación entre artefactos
  const goToPrevious = useCallback(() => {
    setState((prev) => {
      const currentIndex = prev.artifacts.findIndex(
        (a) => a.id === prev.selectedId
      );
      if (currentIndex > 0) {
        return {
          ...prev,
          selectedId: prev.artifacts[currentIndex - 1].id,
          autoSync: false,
        };
      }
      return prev;
    });
  }, []);

  const goToNext = useCallback(() => {
    setState((prev) => {
      const currentIndex = prev.artifacts.findIndex(
        (a) => a.id === prev.selectedId
      );
      if (currentIndex < prev.artifacts.length - 1) {
        return {
          ...prev,
          selectedId: prev.artifacts[currentIndex + 1].id,
          autoSync: false,
        };
      }
      return prev;
    });
  }, []);

  // Índice actual para mostrar "1/5"
  const currentIndex = state.selectedId
    ? state.artifacts.findIndex((a) => a.id === state.selectedId) + 1
    : 0;

  // Limpiar todos los artefactos
  const clearArtifacts = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // Estado
    artifacts: state.artifacts,
    selectedArtifact,
    selectedId: state.selectedId,
    autoSync: state.autoSync,
    currentIndex,
    totalArtifacts: state.artifacts.length,

    // Acciones
    addArtifact,
    selectArtifact,
    enableAutoSync,
    getArtifactForMessage,
    goToPrevious,
    goToNext,
    clearArtifacts,
  };
}
