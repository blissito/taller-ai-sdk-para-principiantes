// Admin Dashboard HTML Generator
export function adminDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Chat Widget</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; margin: 0; }
    h1::before { content: ""; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
    .btn-logout { background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-logout:hover { background: #334155; color: #e2e8f0; border-color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; border: 1px solid #334155; }
    .card h2 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 1rem; }
    .stat { font-size: 2.5rem; font-weight: 700; color: #f8fafc; }
    .stat-label { font-size: 0.875rem; color: #64748b; }
    .list { list-style: none; }
    .list li { padding: 0.75rem; background: #0f172a; border-radius: 8px; margin-bottom: 0.5rem; font-family: monospace; font-size: 0.875rem; display: flex; justify-content: space-between; }
    .list .origin { color: #38bdf8; }
    .list .expires { color: #64748b; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .badge-green { background: #166534; color: #86efac; }
    .badge-yellow { background: #854d0e; color: #fde047; }
    .empty { color: #64748b; font-style: italic; }

    /* Form styles */
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.5rem; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 0.75rem; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: #e2e8f0; font-size: 0.875rem;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none; border-color: #3b82f6;
    }
    .form-group textarea { resize: vertical; min-height: 100px; font-family: monospace; }
    .btn {
      padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer;
      border: none; font-size: 0.875rem; transition: all 0.2s;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #334155; color: #e2e8f0; }
    .btn-secondary:hover { background: #475569; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* File upload */
    .file-upload {
      border: 2px dashed #334155; border-radius: 8px; padding: 1.5rem; text-align: center;
      cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column;
      align-items: center; justify-content: center; min-height: 120px;
    }
    .file-upload:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .file-upload input { display: none; }
    .file-upload-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .file-upload-text { color: #64748b; font-size: 0.75rem; line-height: 1.4; }

    /* Chips */
    .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem;
      background: #0f172a; border-radius: 9999px; font-size: 0.875rem;
    }
    .chip-remove { cursor: pointer; opacity: 0.5; }
    .chip-remove:hover { opacity: 1; }

    /* Toggle Switch */
    .toggle-container { display: flex; align-items: center; gap: 1rem; }
    .toggle { position: relative; width: 56px; height: 28px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: #334155; border-radius: 9999px; transition: 0.3s;
    }
    .toggle-slider:before {
      content: ""; position: absolute; width: 22px; height: 22px;
      left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;
    }
    .toggle input:checked + .toggle-slider { background: #22c55e; }
    .toggle input:checked + .toggle-slider:before { transform: translateX(28px); }
    .toggle-label { font-size: 0.875rem; color: #94a3b8; }
    .toggle-label.active { color: #22c55e; font-weight: 500; }

    /* Alert box */
    .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
    .alert-warning { background: rgba(234, 179, 8, 0.1); border: 1px solid #eab308; color: #fde047; }
    .alert-success { background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; color: #86efac; }

    /* Copy button */
    .btn-copy { background: #334155; border: none; color: #94a3b8; padding: 0.2rem 0.4rem; border-radius: 4px; cursor: pointer; font-size: 0.7rem; margin-left: 0.5rem; }
    .btn-copy:hover { background: #475569; color: #e2e8f0; }
    .btn-copy.copied { background: #166534; color: #86efac; }

    /* Tabs */
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
    .tab { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; color: #94a3b8; }
    .tab:hover { background: #334155; }
    .tab.active { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Chat Widget Admin</h1>
      <button class="btn-logout" onclick="logout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16,17 21,12 16,7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Cerrar sesion
      </button>
    </div>

    <div class="tabs">
      <div class="tab active" onclick="showTab('dashboard')">Dashboard</div>
      <div class="tab" onclick="showTab('config')">Configuracion</div>
      <div class="tab" onclick="showTab('embed')">Embeber</div>
      <div class="tab" onclick="showTab('training')">Entrenamiento</div>
    </div>

    <!-- Dashboard Tab -->
    <div id="tab-dashboard" class="tab-content">
      <div class="grid">
        <div class="card">
          <h2>Sesiones Activas</h2>
          <div class="stat" id="session-count">-</div>
          <div class="stat-label">conexiones actuales</div>
        </div>

        <div class="card">
          <h2>Total Mensajes</h2>
          <div class="stat" id="total-messages">-</div>
          <div class="stat-label"><span id="user-messages">-</span> usuario / <span id="assistant-messages">-</span> asistente</div>
        </div>

        <div class="card">
          <h2>Conversaciones</h2>
          <div class="stat" id="total-sessions">-</div>
          <div class="stat-label">sesiones con mensajes</div>
        </div>

        <div class="card">
          <h2>Costo Total</h2>
          <div class="stat" id="total-cost">-</div>
          <div class="stat-label"><span id="total-tokens">-</span> tokens</div>
        </div>

        <div class="card">
          <h2>Requests API</h2>
          <div class="stat" id="total-requests">-</div>
          <div class="stat-label">latencia prom: <span id="avg-latency">-</span></div>
        </div>

        <div class="card">
          <h2>Modo</h2>
          <div id="mode-badge"></div>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Mensajes Ultimos 7 Dias</h2>
          <ul class="list" id="messages-by-day">
            <li class="empty">Cargando...</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Mensajes por Origen</h2>
          <ul class="list" id="messages-by-origin">
            <li class="empty">Cargando...</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Uso por Dia (Tokens y Costo)</h2>
          <ul class="list" id="usage-by-day">
            <li class="empty">Cargando...</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Costo por Origen</h2>
          <ul class="list" id="usage-by-origin">
            <li class="empty">Cargando...</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Sesiones Activas</h2>
          <ul class="list" id="sessions-list">
            <li class="empty">Cargando...</li>
          </ul>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Origenes Permitidos</h2>
          <div id="origins-chips" class="chips"></div>
          <p id="origins-empty" class="empty" style="margin-top: 1rem;"></p>
        </div>
      </div>
    </div>

    <!-- Config Tab -->
    <div id="tab-config" class="tab-content" style="display: none;">
      <div class="grid">
        <div class="card" style="grid-column: span 2;">
          <h2>Control de Acceso</h2>
          <div id="access-alert"></div>

          <div class="toggle-container" style="margin-bottom: 1.5rem;">
            <label class="toggle">
              <input type="checkbox" id="public-access-toggle" onchange="togglePublicAccess()">
              <span class="toggle-slider"></span>
            </label>
            <div>
              <span id="public-access-label" class="toggle-label">Acceso Publico</span>
              <p style="color: #64748b; font-size: 0.75rem; margin-top: 0.25rem;">
                Cuando esta activo, cualquier sitio web puede usar tu widget (CORS *)
              </p>
            </div>
          </div>

          <h3 style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.75rem;">Origenes Permitidos</h3>

          <!-- Orígenes de ENV VARS (read-only) - siempre visible -->
          <div id="env-origins-section" style="margin-bottom: 1rem; display: none;">
            <label style="display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">
              De variables de entorno (solo lectura)
            </label>
            <div id="env-origins-chips" class="chips"></div>
          </div>

          <!-- Orígenes editables (DB) - se deshabilita en modo público -->
          <div id="origins-section">
            <div class="form-group">
              <label style="display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">
                Agregar desde el panel
              </label>
              <input type="text" id="new-origin-input" placeholder="midominio.com, otro.com" style="font-family: monospace;">
              <p style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">Separados por comas. Soporta subdominios automaticamente.</p>
            </div>
            <button class="btn btn-primary" onclick="saveOrigins()">Guardar Origenes</button>
          </div>
        </div>

        <div class="card">
          <h2>Modelo</h2>
          <div class="form-group">
            <label>Selecciona el modelo de IA</label>
            <select disabled>
              <option selected>gpt-4o-mini-2024-07-18</option>
              <option>gpt-4.1-mini</option>
              <option>gpt-4o</option>
              <option>claude-sonnet-4-20250514</option>
            </select>
          </div>
          <p class="empty">Proximamente: cambio de modelo en caliente</p>
        </div>

        <div class="card">
          <h2>System Prompt</h2>
          <div class="form-group">
            <label>Plantilla predefinida</label>
            <select disabled>
              <option>Asistente General</option>
              <option>Soporte Tecnico</option>
              <option>Ventas</option>
              <option>FAQ Bot</option>
              <option>Personalizado...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prompt personalizado</label>
            <textarea disabled placeholder="Eres un asistente amable que ayuda a los usuarios..."></textarea>
          </div>
          <button class="btn btn-primary" disabled>Guardar Prompt</button>
          <p class="empty" style="margin-top: 1rem;">Proximamente: edicion de system prompts</p>
        </div>
      </div>
    </div>

    <!-- Embed Tab -->
    <div id="tab-embed" class="tab-content" style="display: none;">
      <div class="grid">
        <div class="card" style="grid-column: span 2;">
          <h2>URL del Servidor</h2>
          <p style="color: #94a3b8; margin-bottom: 1rem;">Ingresa la URL de tu servidor en produccion (ej: https://tu-app.fly.dev)</p>
          <div class="form-group">
            <input type="url" id="server-url" value="https://ai-sdk-curso.fly.dev" oninput="generateEmbedCode()" style="font-size: 1rem;">
          </div>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Codigo de Integracion</h2>
          <p style="color: #94a3b8; margin-bottom: 1rem;">Copia y pega este codigo en tu sitio web, justo antes de la etiqueta &lt;/body&gt;</p>
          <div class="form-group">
            <div style="position: relative;">
              <pre id="embed-code" style="background: #0f172a; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; border: 1px solid #334155;"></pre>
              <button class="btn btn-primary" onclick="copyCode()" style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.5rem 1rem;">
                <span id="copy-btn-text">Copiar</span>
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Requisitos</h2>
          <ul style="list-style: disc; padding-left: 1.5rem; color: #94a3b8; line-height: 2;">
            <li>Tu dominio debe estar en <strong style="color: #f8fafc;">ALLOWED_ORIGINS</strong></li>
            <li>El widget se carga en un iframe seguro</li>
            <li>Cada visitante obtiene una sesion de 2 horas</li>
            <li>El historial se guarda por sesion</li>
          </ul>
        </div>

        <div class="card">
          <h2>Personalizacion</h2>
          <p style="color: #94a3b8; margin-bottom: 1rem;">El boton flotante aparece en la esquina inferior derecha. Puedes personalizar:</p>
          <ul style="list-style: disc; padding-left: 1.5rem; color: #94a3b8; line-height: 2;">
            <li><code style="background: #334155; padding: 0.2rem 0.4rem; border-radius: 4px;">bottom</code> y <code style="background: #334155; padding: 0.2rem 0.4rem; border-radius: 4px;">right</code> del boton</li>
            <li>Dimensiones del iframe (400x600 por defecto)</li>
            <li>Colores editando el CSS del cliente</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Training Tab -->
    <div id="tab-training" class="tab-content" style="display: none;">
      <div class="grid">
        <div class="card">
          <h2>Subir Archivos</h2>
          <label class="file-upload">
            <input type="file" multiple accept=".txt,.pdf,.md,.json" disabled>
            <div class="file-upload-icon">📄</div>
            <div class="file-upload-text">Arrastra o selecciona<br>.txt .pdf .md .json</div>
          </label>
        </div>

        <div class="card">
          <h2>Estado</h2>
          <div class="stat">0</div>
          <div class="stat-label">documentos indexados</div>
          <button class="btn btn-secondary" style="margin-top: 1rem; width: 100%;" disabled>Reindexar</button>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Base de Conocimiento</h2>
          <ul class="list">
            <li class="empty">No hay documentos cargados</li>
          </ul>
          <p class="empty" style="margin-top: 1rem;">Proximamente: RAG con embeddings para contexto personalizado</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Logout - clear Basic Auth credentials
    function logout() {
      // Create XMLHttpRequest with wrong credentials to clear browser cache
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/admin', true, 'logout', 'logout');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          // Redirect to admin to trigger new login prompt
          window.location.href = '/admin';
        }
      };
      xhr.send();
    }

    // State
    let currentTab = 'dashboard';
    let currentConfig = { publicAccess: false, allowedOrigins: '' };

    // Copy origin to clipboard
    function copyOrigin(origin, btn) {
      navigator.clipboard.writeText(origin).then(() => {
        btn.textContent = 'ok';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'cp';
          btn.classList.remove('copied');
        }, 1500);
      });
    }

    // Tab switching - persiste la pestaña activa
    function showTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).style.display = 'block';
      document.querySelector('.tab[onclick*="' + tab + '"]').classList.add('active');
    }

    // Toggle public access
    async function togglePublicAccess() {
      const toggle = document.getElementById('public-access-toggle');
      const newValue = toggle.checked;

      try {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicAccess: newValue })
        });

        if (res.ok) {
          currentConfig.publicAccess = newValue;
          updateAccessUI();
        } else {
          toggle.checked = !newValue; // revert
        }
      } catch (err) {
        console.error('Error:', err);
        toggle.checked = !newValue; // revert
      }
    }

    // Save origins
    async function saveOrigins() {
      const input = document.getElementById('new-origin-input');
      const origins = input.value;

      try {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allowedOrigins: origins })
        });

        if (res.ok) {
          currentConfig.allowedOrigins = origins;
          const alertEl = document.getElementById('access-alert');
          alertEl.innerHTML = '<div class="alert alert-success">Origenes guardados correctamente</div>';
          setTimeout(() => { alertEl.innerHTML = ''; }, 3000);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    // Update access UI based on config
    function updateAccessUI() {
      const toggle = document.getElementById('public-access-toggle');
      const label = document.getElementById('public-access-label');
      const section = document.getElementById('origins-section');
      const alertEl = document.getElementById('access-alert');

      toggle.checked = currentConfig.publicAccess;
      label.className = 'toggle-label' + (currentConfig.publicAccess ? ' active' : '');

      if (currentConfig.publicAccess) {
        section.style.opacity = '0.5';
        section.style.pointerEvents = 'none';
        alertEl.innerHTML = '<div class="alert alert-success">Modo publico activo - cualquier sitio puede usar el widget</div>';
      } else {
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
        alertEl.innerHTML = '';
      }
    }

    // Load stats
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        document.getElementById('session-count').textContent = data.activeSessions;

        // Config
        if (data.config) {
          currentConfig = data.config;
          document.getElementById('public-access-toggle').checked = data.config.publicAccess;
          document.getElementById('new-origin-input').value = data.config.allowedOrigins || '';
          updateAccessUI();

          // Show env origins as chips
          const envSection = document.getElementById('env-origins-section');
          const envChips = document.getElementById('env-origins-chips');
          if (data.envOrigins && data.envOrigins.length > 0) {
            envSection.style.display = 'block';
            envChips.innerHTML = data.envOrigins.map(o =>
              '<span class="chip" style="background: #1e3a5f; border: 1px solid #3b82f6;">' + o + ' <span style="opacity: 0.5; font-size: 0.7rem;">ENV</span></span>'
            ).join('');
          } else {
            envSection.style.display = 'none';
          }
        }

        // Message stats
        if (data.messages) {
          document.getElementById('total-messages').textContent = data.messages.totalMessages || 0;
          document.getElementById('user-messages').textContent = data.messages.userMessages || 0;
          document.getElementById('assistant-messages').textContent = data.messages.assistantMessages || 0;
          document.getElementById('total-sessions').textContent = data.messages.totalSessions || 0;
        }

        // Usage stats
        if (data.usage) {
          const costUsd = (data.usage.totalCostMicro || 0) / 1000000;
          document.getElementById('total-cost').textContent = '$' + costUsd.toFixed(4);
          document.getElementById('total-tokens').textContent = (data.usage.totalTokens || 0).toLocaleString();
          document.getElementById('total-requests').textContent = data.usage.totalRequests || 0;
          document.getElementById('avg-latency').textContent = Math.round(data.usage.avgLatencyMs || 0) + 'ms';

          // Usage by day
          const usageByDayEl = document.getElementById('usage-by-day');
          if (data.usage.byDay && data.usage.byDay.length > 0) {
            usageByDayEl.innerHTML = data.usage.byDay.map(d => {
              const cost = (d.costMicro || 0) / 1000000;
              return '<li><span class="origin">' + d.day + '</span><span class="expires">' + (d.tokens || 0).toLocaleString() + ' tokens / $' + cost.toFixed(4) + ' / ' + d.requests + ' reqs / ' + Math.round(d.avgLatency || 0) + 'ms</span></li>';
            }).join('');
          } else {
            usageByDayEl.innerHTML = '<li class="empty">Sin datos de uso esta semana</li>';
          }

          // Usage by origin
          const usageByOriginEl = document.getElementById('usage-by-origin');
          if (data.usage.byOrigin && data.usage.byOrigin.length > 0) {
            usageByOriginEl.innerHTML = data.usage.byOrigin.map(o => {
              const cost = (o.costMicro || 0) / 1000000;
              return '<li><span class="origin">' + o.origin + '</span><span class="expires">$' + cost.toFixed(4) + ' / ' + (o.tokens || 0).toLocaleString() + ' tokens / ' + o.requests + ' reqs</span></li>';
            }).join('');
          } else {
            usageByOriginEl.innerHTML = '<li class="empty">Sin datos de uso por origen</li>';
          }
        }

        // Messages by day
        const byDayEl = document.getElementById('messages-by-day');
        if (data.messages && data.messages.byDay && data.messages.byDay.length > 0) {
          byDayEl.innerHTML = data.messages.byDay.map(d =>
            '<li><span class="origin">' + d.day + '</span><span class="expires">' + d.count + ' msgs / ' + d.sessions + ' sesiones</span></li>'
          ).join('');
        } else {
          byDayEl.innerHTML = '<li class="empty">Sin mensajes esta semana</li>';
        }

        // Messages by origin
        const byOriginEl = document.getElementById('messages-by-origin');
        if (data.messages && data.messages.byOrigin && data.messages.byOrigin.length > 0) {
          byOriginEl.innerHTML = data.messages.byOrigin.map(o =>
            '<li><span class="origin">' + o.origin + '</span><span class="expires">' + o.messageCount + ' msgs / ' + o.sessionCount + ' sesiones</span></li>'
          ).join('');
        } else {
          byOriginEl.innerHTML = '<li class="empty">Sin mensajes por origen</li>';
        }

        const modeEl = document.getElementById('mode-badge');
        modeEl.innerHTML = data.isDev
          ? '<span class="badge badge-yellow">Desarrollo</span>'
          : '<span class="badge badge-green">Produccion</span>';

        const listEl = document.getElementById('sessions-list');
        if (data.sessions.length === 0) {
          listEl.innerHTML = '<li class="empty">No hay sesiones activas</li>';
        } else {
          listEl.innerHTML = data.sessions.map(s =>
            '<li><span class="origin">' + s.origin + '</span><span class="expires">' + s.expiresIn + ' <button class="btn-copy" data-origin="' + s.origin + '" onclick="copyOrigin(this.dataset.origin, this)" title="Copiar origen">cp</button></span></li>'
          ).join('');
        }

        const chipsEl = document.getElementById('origins-chips');
        const emptyEl = document.getElementById('origins-empty');
        if (data.allowedOrigins.length === 0) {
          chipsEl.innerHTML = '';
          emptyEl.textContent = data.isDev
            ? 'Modo desarrollo: todos los origenes permitidos'
            : 'No hay origenes configurados. Usa ALLOWED_ORIGINS en env vars.';
        } else {
          chipsEl.innerHTML = data.allowedOrigins.map(o =>
            '<span class="chip">' + o + '</span>'
          ).join('');
          emptyEl.textContent = '';
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }

    // Initial load and refresh every 10s
    loadStats();
    setInterval(loadStats, 10000);

    // Generate embed code
    function generateEmbedCode() {
      const input = document.getElementById('server-url');
      const serverUrl = input.value.trim() || window.location.origin;
      const code = '<!-- Chat Widget (sidebar que empuja contenido) -->\\n<script src="' + serverUrl + '/embed.js"></' + 'script>';

      document.getElementById('embed-code').textContent = code;
    }

    // Copy code to clipboard
    function copyCode() {
      const code = document.getElementById('embed-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copy-btn-text');
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
      });
    }

    // Generate embed code on load
    generateEmbedCode();
  </script>
</body>
</html>`;
}
