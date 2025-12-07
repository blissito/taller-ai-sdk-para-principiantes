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
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; }
    h1::before { content: ""; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
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

    /* Tabs */
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
    .tab { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; color: #94a3b8; }
    .tab:hover { background: #334155; }
    .tab.active { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Chat Widget Admin</h1>

    <div class="tabs">
      <div class="tab active" onclick="showTab('dashboard')">Dashboard</div>
      <div class="tab" onclick="showTab('config')">Configuracion</div>
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
          <h2>Modo</h2>
          <div id="mode-badge"></div>
        </div>

        <div class="card" style="grid-column: span 2;">
          <h2>Sesiones</h2>
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

        <div class="card" style="grid-column: span 2;">
          <h2>Agregar Origen Permitido</h2>
          <div class="form-group">
            <label>URL del sitio (ej: https://midominio.com)</label>
            <input type="url" id="new-origin" placeholder="https://ejemplo.com" disabled>
          </div>
          <button class="btn btn-primary" disabled>Agregar Origen</button>
          <p class="empty" style="margin-top: 1rem;">Proximamente: gestion de origenes desde el dashboard</p>
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
    // Tab switching
    function showTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).style.display = 'block';
      document.querySelector('.tab[onclick*="' + tab + '"]').classList.add('active');
    }

    // Load stats
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        document.getElementById('session-count').textContent = data.activeSessions;

        const modeEl = document.getElementById('mode-badge');
        modeEl.innerHTML = data.isDev
          ? '<span class="badge badge-yellow">Desarrollo</span>'
          : '<span class="badge badge-green">Produccion</span>';

        const listEl = document.getElementById('sessions-list');
        if (data.sessions.length === 0) {
          listEl.innerHTML = '<li class="empty">No hay sesiones activas</li>';
        } else {
          listEl.innerHTML = data.sessions.map(s =>
            '<li><span class="origin">' + s.origin + '</span><span class="expires">' + s.expiresIn + '</span></li>'
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
  </script>
</body>
</html>`;
}
