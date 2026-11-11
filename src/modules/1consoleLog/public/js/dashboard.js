/**
 * ==========================================================================
 * API DEBUG CONSOLE - CLIENT DASHBOARD LOGIC
 * Real-time SSE Connection, Filtering, Search, and Request Inspection
 * ==========================================================================
 */

(function () {
  'use strict';

  // State Management
  const state = {
    logs: [],
    selectedLog: null,
    isPaused: false,
    filters: {
      search: '',
      method: 'ALL',
      status: 'ALL',
      module: 'ALL',
    },
    eventSource: null,
    reconnectTimer: null,
    reconnectAttempts: 0,
  };

  // DOM Elements
  const elements = {
    connectionPill: document.getElementById('connectionPill'),
    connectionStatusText: document.getElementById('connectionStatusText'),
    btnPause: document.getElementById('btnPause'),
    btnClear: document.getElementById('btnClear'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    moduleFilter: document.getElementById('moduleFilter'),
    methodPills: document.querySelectorAll('.method-pill'),
    logTableBody: document.getElementById('logTableBody'),
    emptyState: document.getElementById('emptyState'),
    tableContainer: document.getElementById('tableContainer'),

    // Stats
    statTotal: document.getElementById('statTotal'),
    statSuccess: document.getElementById('statSuccess'),
    statFailed: document.getElementById('statFailed'),
    statGet: document.getElementById('statGet'),
    statPost: document.getElementById('statPost'),
    statPut: document.getElementById('statPut'),
    statPatch: document.getElementById('statPatch'),
    statDelete: document.getElementById('statDelete'),
    statAvgDuration: document.getElementById('statAvgDuration'),

    // Modal
    modalOverlay: document.getElementById('modalOverlay'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalMethodBadge: document.getElementById('modalMethodBadge'),
    modalStatusBadge: document.getElementById('modalStatusBadge'),
    modalEndpoint: document.getElementById('modalEndpoint'),
    infoRequestId: document.getElementById('infoRequestId'),
    infoTimestamp: document.getElementById('infoTimestamp'),
    infoModule: document.getElementById('infoModule'),
    infoCategory: document.getElementById('infoCategory'),
    infoSubcategory: document.getElementById('infoSubcategory'),
    infoDuration: document.getElementById('infoDuration'),
    infoController: document.getElementById('infoController'),
    infoService: document.getElementById('infoService'),

    // Modal Bodies
    sectionParams: document.getElementById('sectionParams'),
    sectionQuery: document.getElementById('sectionQuery'),
    sectionHeaders: document.getElementById('sectionHeaders'),
    requestBodyBox: document.getElementById('requestBodyBox'),
    responseBodyBox: document.getElementById('responseBodyBox'),
    errorSection: document.getElementById('errorSection'),
    errorType: document.getElementById('errorType'),
    errorMessage: document.getElementById('errorMessage'),
    errorLocation: document.getElementById('errorLocation'),

    // Copy buttons
    btnCopyReqId: document.getElementById('btnCopyReqId'),
    btnCopyReqBody: document.getElementById('btnCopyReqBody'),
    btnCopyResBody: document.getElementById('btnCopyResBody'),
  };

  // Safe HTML Escaper to prevent any XSS/Injection
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format JSON with indentation
  function formatJson(data) {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }

  // Determine Duration CSS class
  function getDurationClass(ms) {
    if (ms < 100) return 'fast';
    if (ms < 500) return 'medium';
    return 'slow';
  }

  // Determine Status CSS class
  function getStatusClass(status) {
    if (status >= 200 && status < 300) return 's-2xx';
    if (status >= 300 && status < 400) return 's-3xx';
    if (status >= 400 && status < 500) return 's-4xx';
    return 's-5xx';
  }

  // ==========================================
  // INITIAL DATA FETCH & SSE STREAMING
  // ==========================================

  async function fetchInitialLogs() {
    try {
      const res = await fetch('/__dev/api-logs/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        state.logs = result.data;
        updateStats(result.stats);
        updateModuleFilterOptions(result.stats?.modules || []);
        renderTable();
      }
    } catch (err) {
      console.warn('Failed to load initial log history:', err);
    }
  }

  function connectSseStream() {
    if (state.eventSource) {
      state.eventSource.close();
    }

    setConnectionStatus('connecting');

    const sse = new EventSource('/__dev/api-logs/stream');
    state.eventSource = sse;

    sse.addEventListener('connected', () => {
      setConnectionStatus('connected');
      state.reconnectAttempts = 0;
    });

    sse.addEventListener('log', (event) => {
      if (state.isPaused) return;

      try {
        const newLog = JSON.parse(event.data);
        if (!newLog || !newLog.id) return;

        // Prevent duplicate entries
        if (state.logs.some((l) => l.id === newLog.id)) return;

        state.logs.unshift(newLog);
        if (state.logs.length > 500) {
          state.logs.length = 500;
        }

        recalculateStatsAndModules();
        renderTable(newLog.id);
      } catch (err) {
        console.error('Failed to parse incoming SSE log:', err);
      }
    });

    sse.addEventListener('clear', () => {
      state.logs = [];
      recalculateStatsAndModules();
      renderTable();
      closeModal();
    });

    sse.onerror = () => {
      setConnectionStatus('disconnected');
      sse.close();
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (state.reconnectTimer) clearTimeout(state.reconnectTimer);

    state.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, state.reconnectAttempts), 10000);

    state.reconnectTimer = setTimeout(() => {
      connectSseStream();
    }, delay);
  }

  function setConnectionStatus(status) {
    const pill = elements.connectionPill;
    const text = elements.connectionStatusText;

    pill.className = 'connection-pill';

    if (status === 'connected') {
      pill.classList.remove('disconnected', 'paused');
      text.textContent = 'Live Connected';
    } else if (status === 'connecting') {
      pill.classList.add('paused');
      text.textContent = 'Connecting...';
    } else {
      pill.classList.add('disconnected');
      text.textContent = 'Disconnected (Retrying)';
    }
  }

  // ==========================================
  // FILTERING & SEARCHING
  // ==========================================

  function getFilteredLogs() {
    const { search, method, status, module } = state.filters;
    const query = search.trim().toLowerCase();

    return state.logs.filter((item) => {
      // Method filter
      if (method !== 'ALL' && item.method !== method) {
        return false;
      }

      // Module filter
      if (module !== 'ALL' && item.module !== module) {
        return false;
      }

      // Status filter
      if (status !== 'ALL') {
        if (status === '2xx' && (item.status < 200 || item.status >= 300)) return false;
        if (status === '3xx' && (item.status < 300 || item.status >= 400)) return false;
        if (status === '4xx' && (item.status < 400 || item.status >= 500)) return false;
        if (status === '5xx' && item.status < 500) return false;
        if (['success'].includes(status) && !item.success) return false;
        if (['failed'].includes(status) && item.success) return false;
      }

      // Search query
      if (query !== '') {
        const matchEndpoint = item.endpoint && item.endpoint.toLowerCase().includes(query);
        const matchModule = item.module && item.module.toLowerCase().includes(query);
        const matchCategory = item.category && item.category.toLowerCase().includes(query);
        const matchSubcategory = item.subcategory && item.subcategory.toLowerCase().includes(query);
        const matchReqId = item.requestId && item.requestId.toLowerCase().includes(query);
        if (!matchEndpoint && !matchModule && !matchCategory && !matchSubcategory && !matchReqId) {
          return false;
        }
      }

      return true;
    });
  }

  // ==========================================
  // TABLE RENDERING
  // ==========================================

  function renderTable(highlightId = null) {
    const filtered = getFilteredLogs();

    if (filtered.length === 0) {
      elements.logTableBody.innerHTML = '';
      elements.emptyState.style.display = 'block';
      elements.tableContainer.style.display = 'none';
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.tableContainer.style.display = 'block';

    const rowsHtml = filtered
      .map((log) => {
        const durationClass = getDurationClass(log.duration);
        const statusClass = getStatusClass(log.status);
        const isNew = highlightId && log.id === highlightId ? 'new-entry' : '';

        return `
          <tr data-id="${escapeHtml(log.id)}" class="${isNew}">
            <td class="col-time">${escapeHtml(log.timeFormatted || log.timestamp)}</td>
            <td><span class="badge-method ${escapeHtml(log.method)}">${escapeHtml(log.method)}</span></td>
            <td class="col-module">${escapeHtml(log.module || '-')}</td>
            <td class="col-category">${escapeHtml(log.category || '-')}</td>
            <td class="col-subcategory">${escapeHtml(log.subcategory || '-')}</td>
            <td class="col-endpoint" title="${escapeHtml(log.endpoint)}">${escapeHtml(log.endpoint)}</td>
            <td><span class="badge-status ${statusClass}">${escapeHtml(log.status)} ${escapeHtml(log.statusText)}</span></td>
            <td class="col-duration ${durationClass}">${escapeHtml(log.duration)}ms</td>
            <td><button class="btn btn-secondary btn-view" data-id="${escapeHtml(log.id)}">Inspect</button></td>
          </tr>
        `;
      })
      .join('');

    elements.logTableBody.innerHTML = rowsHtml;
  }

  // ==========================================
  // STATISTICS & MODULE DROPDOWN
  // ==========================================

  function recalculateStatsAndModules() {
    let successful = 0;
    let failed = 0;
    let totalDuration = 0;
    const methods = { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 };
    const modulesSet = new Set();

    for (const log of state.logs) {
      if (log.success) successful++;
      else failed++;

      totalDuration += log.duration || 0;

      if (methods[log.method] !== undefined) {
        methods[log.method]++;
      }
      if (log.module) {
        modulesSet.add(log.module);
      }
    }

    const total = state.logs.length;
    const avgDuration = total > 0 ? (totalDuration / total).toFixed(1) : '0';

    updateStats({
      total,
      successful,
      failed,
      methods,
      avgDuration,
    });

    updateModuleFilterOptions(Array.from(modulesSet).sort());
  }

  function updateStats(stats = {}) {
    if (!stats) return;
    elements.statTotal.textContent = stats.total || 0;
    elements.statSuccess.textContent = stats.successful || 0;
    elements.statFailed.textContent = stats.failed || 0;
    elements.statGet.textContent = stats.methods?.GET || 0;
    elements.statPost.textContent = stats.methods?.POST || 0;
    elements.statPut.textContent = stats.methods?.PUT || 0;
    elements.statPatch.textContent = stats.methods?.PATCH || 0;
    elements.statDelete.textContent = stats.methods?.DELETE || 0;
    elements.statAvgDuration.textContent = `${stats.avgDuration || 0}ms`;
  }

  function updateModuleFilterOptions(modulesList = []) {
    const currentVal = elements.moduleFilter.value;
    const options = ['<option value="ALL">All Modules</option>'];

    for (const mod of modulesList) {
      const selected = mod === currentVal ? 'selected' : '';
      options.push(`<option value="${escapeHtml(mod)}" ${selected}>${escapeHtml(mod)}</option>`);
    }

    elements.moduleFilter.innerHTML = options.join('');
  }

  // ==========================================
  // DETAILS MODAL
  // ==========================================

  function openLogModal(id) {
    const log = state.logs.find((item) => item.id === id);
    if (!log) return;

    state.selectedLog = log;

    // Header Badges
    elements.modalMethodBadge.textContent = log.method;
    elements.modalMethodBadge.className = `badge-method ${log.method}`;

    elements.modalStatusBadge.textContent = `${log.status} ${log.statusText}`;
    elements.modalStatusBadge.className = `badge-status ${getStatusClass(log.status)}`;

    elements.modalEndpoint.textContent = log.endpoint;

    // General Info Grid
    elements.infoRequestId.textContent = log.requestId || '-';
    elements.infoTimestamp.textContent = log.timeFormatted || log.timestamp;
    elements.infoModule.textContent = log.module || '-';
    elements.infoCategory.textContent = log.category || '-';
    elements.infoSubcategory.textContent = log.subcategory || '-';
    elements.infoDuration.textContent = `${log.duration}ms`;
    elements.infoController.textContent = log.controller || '-';
    elements.infoService.textContent = log.service || '-';

    // Parameters & Headers
    renderSubSection(elements.sectionParams, log.params, 'URL Parameters');
    renderSubSection(elements.sectionQuery, log.query, 'Query Parameters');
    renderSubSection(elements.sectionHeaders, log.headers, 'Safe Request Headers');

    // Request & Response JSON
    elements.requestBodyBox.textContent = formatJson(log.requestBody);
    elements.responseBodyBox.textContent = formatJson(log.responseBody);

    // Error Section
    if (log.error) {
      elements.errorSection.style.display = 'block';
      elements.errorType.textContent = log.error.errorType || 'ERROR';
      elements.errorMessage.textContent = log.error.errorMessage || 'An error occurred';
      elements.errorLocation.textContent = log.error.location ? `Location: ${log.error.location}` : '';
    } else {
      elements.errorSection.style.display = 'none';
    }

    elements.modalOverlay.classList.add('active');
  }

  function renderSubSection(container, data, title) {
    if (!data || Object.keys(data).length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    const pre = container.querySelector('pre');
    if (pre) {
      pre.textContent = formatJson(data);
    }
  }

  function closeModal() {
    elements.modalOverlay.classList.remove('active');
    state.selectedLog = null;
  }

  // Copy helper
  async function copyToClipboard(text, btnElement) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btnElement.textContent;
      btnElement.textContent = 'Copied!';
      btnElement.style.color = '#34d399';
      setTimeout(() => {
        btnElement.textContent = originalText;
        btnElement.style.color = '';
      }, 1500);
    } catch {
      // Fallback
    }
  }

  // ==========================================
  // EVENT LISTENERS & INITIALIZATION
  // ==========================================

  function setupEventListeners() {
    // Row click & Inspect button
    elements.logTableBody.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (!row) return;
      const logId = row.getAttribute('data-id');
      if (logId) {
        openLogModal(logId);
      }
    });

    // Close Modal
    elements.modalCloseBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    // Copy Buttons
    elements.btnCopyReqId.addEventListener('click', () => {
      if (state.selectedLog?.requestId) {
        copyToClipboard(state.selectedLog.requestId, elements.btnCopyReqId);
      }
    });

    elements.btnCopyReqBody.addEventListener('click', () => {
      if (state.selectedLog) {
        copyToClipboard(formatJson(state.selectedLog.requestBody), elements.btnCopyReqBody);
      }
    });

    elements.btnCopyResBody.addEventListener('click', () => {
      if (state.selectedLog) {
        copyToClipboard(formatJson(state.selectedLog.responseBody), elements.btnCopyResBody);
      }
    });

    // Pause / Resume Toggle
    elements.btnPause.addEventListener('click', () => {
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        elements.btnPause.innerHTML = '▶ Resume Live';
        elements.btnPause.classList.add('btn-danger');
        elements.connectionPill.classList.add('paused');
        elements.connectionStatusText.textContent = 'Paused';
      } else {
        elements.btnPause.innerHTML = '⏸ Pause Live';
        elements.btnPause.classList.remove('btn-danger');
        elements.connectionPill.classList.remove('paused');
        elements.connectionStatusText.textContent = 'Live Connected';
      }
    });

    // Clear Logs Button
    elements.btnClear.addEventListener('click', async () => {
      const confirmClear = window.confirm('Are you sure you want to clear all in-memory API logs?');
      if (!confirmClear) return;

      try {
        const res = await fetch('/__dev/api-logs', { method: 'DELETE' });
        if (res.ok) {
          state.logs = [];
          recalculateStatsAndModules();
          renderTable();
          closeModal();
        }
      } catch (err) {
        console.error('Failed to clear logs:', err);
      }
    });

    // Method Filter Buttons
    elements.methodPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        elements.methodPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.filters.method = pill.getAttribute('data-method');
        renderTable();
      });
    });

    // Status Filter Dropdown
    elements.statusFilter.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      renderTable();
    });

    // Module Filter Dropdown
    elements.moduleFilter.addEventListener('change', (e) => {
      state.filters.module = e.target.value;
      renderTable();
    });

    // Quick Search Input
    elements.searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      renderTable();
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchInitialLogs();
    connectSseStream();
  });
})();

