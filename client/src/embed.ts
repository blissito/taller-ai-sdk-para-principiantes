/**
 * Chat Widget Embed Script
 *
 * Este script crea un sidebar de chat que empuja el contenido del host.
 *
 * Estados:
 * - closed: Solo botón visible, host al 100%
 * - sidebar: Chat 350px a la derecha, host comprimido
 * - expanded: Chat 100%, host oculto
 */

type WidgetState = "closed" | "sidebar" | "expanded";

interface ChatWidgetAPI {
  open: () => void;
  close: () => void;
  expand: () => void;
  toggle: () => void;
  getState: () => WidgetState;
}

(function () {
  // Obtener la URL base del script
  const scriptTag = document.currentScript as HTMLScriptElement;
  const scriptUrl = new URL(scriptTag.src);
  const baseUrl = scriptUrl.origin;

  let state: WidgetState = "closed";
  let wrapper: HTMLDivElement;
  let hostContent: HTMLDivElement;
  let sidebar: HTMLDivElement;
  let iframe: HTMLIFrameElement;
  let toggleBtn: HTMLButtonElement;
  let expandBtn: HTMLButtonElement;

  const SIDEBAR_WIDTH = 380;
  const TRANSITION = "all 0.3s ease-in-out";

  function init() {
    // Crear wrapper que envuelve todo el contenido del body
    wrapper = document.createElement("div");
    wrapper.id = "chat-widget-wrapper";
    wrapper.style.cssText = `
      display: flex;
      min-height: 100vh;
      width: 100%;
    `;

    // Mover todo el contenido actual del body al contenedor host
    hostContent = document.createElement("div");
    hostContent.id = "chat-widget-host";
    hostContent.style.cssText = `
      flex: 1;
      min-width: 0;
      transition: ${TRANSITION};
      overflow: auto;
    `;

    // Mover todos los hijos del body al hostContent
    while (document.body.firstChild) {
      if (document.body.firstChild !== wrapper) {
        hostContent.appendChild(document.body.firstChild);
      } else {
        break;
      }
    }

    // Crear sidebar
    sidebar = document.createElement("div");
    sidebar.id = "chat-widget-sidebar";
    sidebar.style.cssText = `
      width: 0;
      height: 100vh;
      position: sticky;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${TRANSITION};
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    // Crear barra de controles del sidebar
    const controls = document.createElement("div");
    controls.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #1f2937;
      border-bottom: 1px solid #374151;
    `;

    // Botón cerrar/colapsar
    toggleBtn = document.createElement("button");
    toggleBtn.innerHTML = "✕";
    toggleBtn.title = "Cerrar";
    toggleBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `;
    toggleBtn.onmouseover = () => (toggleBtn.style.color = "#fff");
    toggleBtn.onmouseout = () => (toggleBtn.style.color = "#9ca3af");
    toggleBtn.onclick = () => ChatWidget.close();

    // Botón expandir/contraer
    expandBtn = document.createElement("button");
    expandBtn.innerHTML = "⛶";
    expandBtn.title = "Expandir";
    expandBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `;
    expandBtn.onmouseover = () => (expandBtn.style.color = "#fff");
    expandBtn.onmouseout = () => (expandBtn.style.color = "#9ca3af");
    expandBtn.onclick = () => {
      if (state === "expanded") {
        ChatWidget.open(); // volver a sidebar
      } else {
        ChatWidget.expand();
      }
    };

    controls.appendChild(toggleBtn);
    controls.appendChild(expandBtn);

    // Crear iframe
    iframe = document.createElement("iframe");
    iframe.src = `${baseUrl}/widget`;
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
    `;

    sidebar.appendChild(controls);
    sidebar.appendChild(iframe);

    // Crear botón flotante para abrir
    const floatingBtn = document.createElement("button");
    floatingBtn.id = "chat-widget-fab";
    floatingBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    floatingBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: ${TRANSITION};
      z-index: 9999;
    `;
    floatingBtn.onmouseover = () => {
      floatingBtn.style.transform = "scale(1.1)";
      floatingBtn.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.5)";
    };
    floatingBtn.onmouseout = () => {
      floatingBtn.style.transform = "scale(1)";
      floatingBtn.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
    };
    floatingBtn.onclick = () => ChatWidget.toggle();

    // Ensamblar
    wrapper.appendChild(hostContent);
    wrapper.appendChild(sidebar);
    document.body.appendChild(wrapper);
    document.body.appendChild(floatingBtn);

    // Estilos base del body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }

  function updateUI() {
    const fab = document.getElementById("chat-widget-fab") as HTMLButtonElement;

    switch (state) {
      case "closed":
        sidebar.style.width = "0";
        hostContent.style.flex = "1";
        if (fab) fab.style.display = "flex";
        break;

      case "sidebar":
        sidebar.style.width = `${SIDEBAR_WIDTH}px`;
        hostContent.style.flex = "1";
        if (fab) fab.style.display = "none";
        expandBtn.innerHTML = "⛶";
        expandBtn.title = "Expandir";
        break;

      case "expanded":
        sidebar.style.width = "100vw";
        hostContent.style.flex = "0";
        hostContent.style.width = "0";
        hostContent.style.overflow = "hidden";
        if (fab) fab.style.display = "none";
        expandBtn.innerHTML = "⛶";
        expandBtn.title = "Contraer";
        break;
    }
  }

  const ChatWidget: ChatWidgetAPI = {
    open() {
      state = "sidebar";
      hostContent.style.flex = "1";
      hostContent.style.width = "";
      hostContent.style.overflow = "auto";
      updateUI();
    },

    close() {
      state = "closed";
      hostContent.style.flex = "1";
      hostContent.style.width = "";
      hostContent.style.overflow = "auto";
      updateUI();
    },

    expand() {
      state = "expanded";
      updateUI();
    },

    toggle() {
      if (state === "closed") {
        this.open();
      } else {
        this.close();
      }
    },

    getState() {
      return state;
    },
  };

  // Exponer API globalmente
  (window as any).ChatWidget = ChatWidget;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
