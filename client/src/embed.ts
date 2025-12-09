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
  let resizeHandle: HTMLDivElement;
  let controls: HTMLDivElement;
  let iframeContainer: HTMLDivElement;
  let isResizing = false;
  let currentWidth = 380;

  const DEFAULT_SIDEBAR_WIDTH = 380;
  const MIN_SIDEBAR_WIDTH = 280;
  const MAX_SIDEBAR_WIDTH = 800;
  const STEP_SIZE = 50; // Saltos de 50px para sensación de "snap"
  const TRANSITION =
    "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  const HOST_TRANSITION = "margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  function init() {
    // Cargar ancho guardado del localStorage
    const savedWidth = localStorage.getItem("chat-widget-width");
    if (savedWidth) {
      currentWidth = Math.max(
        MIN_SIDEBAR_WIDTH,
        Math.min(MAX_SIDEBAR_WIDTH, parseInt(savedWidth, 10))
      );
    } else {
      currentWidth = DEFAULT_SIDEBAR_WIDTH;
    }

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
      transition: ${HOST_TRANSITION};
      overflow: auto;
      margin-right: 0;
    `;

    // Mover todos los hijos del body al hostContent
    while (document.body.firstChild) {
      if (document.body.firstChild !== wrapper) {
        hostContent.appendChild(document.body.firstChild);
      } else {
        break;
      }
    }

    // Crear sidebar (posición fija, siempre tiene su ancho, usa translateX para animar)
    sidebar = document.createElement("div");
    sidebar.id = "chat-widget-sidebar";
    sidebar.style.cssText = `
      width: ${currentWidth}px;
      height: 100vh;
      position: fixed;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${TRANSITION};
      overflow: visible;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      z-index: 10000;
    `;

    // Crear resize handle (barra vertical en el borde izquierdo)
    resizeHandle = document.createElement("div");
    resizeHandle.id = "chat-widget-resize-handle";
    resizeHandle.style.cssText = `
      position: absolute;
      left: -3px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 60px;
      background: #d1d5db;
      border-radius: 3px;
      cursor: ew-resize;
      z-index: 10;
      opacity: 0.7;
      transition: opacity 0.2s, background 0.2s;
    `;
    resizeHandle.onmouseover = () => {
      resizeHandle.style.opacity = "1";
      resizeHandle.style.background = "#3b82f6";
    };
    resizeHandle.onmouseout = () => {
      if (!isResizing) {
        resizeHandle.style.opacity = "0.6";
        resizeHandle.style.background = "#d1d5db";
      }
    };

    // Funciones de resize
    const startResize = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      sidebar.style.transition = "none";
      hostContent.style.transition = "none";
      resizeHandle.style.opacity = "1";
      resizeHandle.style.background = "#3b82f6";
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      // Desactivar iframe para que no capture eventos del mouse
      iframe.style.pointerEvents = "none";
    };

    const doResize = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rawWidth = window.innerWidth - clientX;
      // Aplicar steps para sensación de "snap"
      const snappedWidth = Math.round(rawWidth / STEP_SIZE) * STEP_SIZE;
      if (
        snappedWidth >= MIN_SIDEBAR_WIDTH &&
        snappedWidth <= MAX_SIDEBAR_WIDTH
      ) {
        if (snappedWidth !== currentWidth) {
          currentWidth = snappedWidth;
          sidebar.style.width = `${currentWidth}px`;
          hostContent.style.marginRight = `${currentWidth}px`;
        }
      }
    };

    const stopResize = () => {
      if (isResizing) {
        isResizing = false;
        sidebar.style.transition = TRANSITION;
        hostContent.style.transition = HOST_TRANSITION;
        resizeHandle.style.opacity = "0.7";
        resizeHandle.style.background = "#d1d5db";
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // Reactivar iframe
        iframe.style.pointerEvents = "";
        localStorage.setItem("chat-widget-width", currentWidth.toString());
      }
    };

    // Mouse events - usar window para capturar incluso si el mouse sale del documento
    resizeHandle.addEventListener("mousedown", startResize);
    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);

    // Touch events para móvil
    resizeHandle.addEventListener("touchstart", startResize, {
      passive: false,
    });
    window.addEventListener("touchmove", doResize, { passive: false });
    window.addEventListener("touchend", stopResize);

    // Crear barra de controles del sidebar
    controls = document.createElement("div");
    controls.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #1f2937;
      border-bottom: 1px solid #374151;
      transition: padding 0.3s ease;
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

    // Crear contenedor del iframe (para poder aplicar padding en fullscreen)
    iframeContainer = document.createElement("div");
    iframeContainer.style.cssText = `
      flex: 1;
      display: flex;
      transition: padding 0.3s ease;
      background: #1f2937;
    `;

    // Crear iframe
    iframe = document.createElement("iframe");
    iframe.src = `${baseUrl}/widget`;
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
    `;

    iframeContainer.appendChild(iframe);
    sidebar.appendChild(resizeHandle);
    sidebar.appendChild(controls);
    sidebar.appendChild(iframeContainer);

    // Crear tab lateral (estilo cajón/drawer)
    const tabBtn = document.createElement("button");
    tabBtn.id = "chat-widget-tab";
    tabBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">Chat</span>
    `;
    tabBtn.style.cssText = `
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      padding: 12px 6px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: ${TRANSITION};
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    tabBtn.onmouseover = () => {
      tabBtn.style.width = "36px";
      tabBtn.style.background = "#2563eb";
    };
    tabBtn.onmouseout = () => {
      tabBtn.style.width = "32px";
      tabBtn.style.background = "#3b82f6";
    };
    tabBtn.onclick = () => ChatWidget.toggle();

    // Ensamblar
    wrapper.appendChild(hostContent);
    wrapper.appendChild(sidebar);
    document.body.appendChild(wrapper);
    document.body.appendChild(tabBtn);

    // Estilos base del body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }

  // Notificar al iframe del cambio de estado
  function notifyIframe(newState: WidgetState) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "widget-state-change",
          state: newState,
        },
        "*"
      );
    }
  }

  function updateUI() {
    const tab = document.getElementById("chat-widget-tab") as HTMLButtonElement;

    switch (state) {
      case "closed":
        sidebar.style.transform = "translateX(100%)";
        sidebar.style.width = `${currentWidth}px`;
        hostContent.style.marginRight = "0";
        hostContent.style.visibility = "visible";
        controls.style.padding = "8px";
        iframeContainer.style.padding = "0";
        if (tab) tab.style.display = "flex";
        resizeHandle.style.display = "none";
        break;

      case "sidebar":
        sidebar.style.transform = "translateX(0)";
        sidebar.style.width = `${currentWidth}px`;
        hostContent.style.marginRight = `${currentWidth}px`;
        hostContent.style.visibility = "visible";
        controls.style.padding = "8px";
        iframeContainer.style.padding = "0";
        if (tab) tab.style.display = "none";
        resizeHandle.style.display = "block";
        expandBtn.innerHTML = "⛶";
        expandBtn.title = "Expandir";
        break;

      case "expanded":
        sidebar.style.transform = "translateX(0)";
        sidebar.style.width = "100vw";
        hostContent.style.marginRight = "100vw";
        hostContent.style.visibility = "hidden"; // Ocultar host en modo expanded
        controls.style.padding = "8px 8px 8px 24px";
        iframeContainer.style.padding = "0 0 0 16px";
        if (tab) tab.style.display = "none";
        resizeHandle.style.display = "none";
        expandBtn.innerHTML = "⛶";
        expandBtn.title = "Contraer";
        break;
    }

    // Notificar al iframe del cambio de estado
    notifyIframe(state);
  }

  const ChatWidget: ChatWidgetAPI = {
    open() {
      state = "sidebar";
      updateUI();
    },

    close() {
      state = "closed";
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
