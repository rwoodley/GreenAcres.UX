// API utility for chat backend
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

// Helper to build headers with optional auth token
function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// POST /api/chat
export async function sendMessage(message, sessionId, token) {
  const payload = { message };
  if (sessionId) payload.sessionId = sessionId;
  const res = await fetch(`${API_BASE}/Chat`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

// GET /api/chat/History
export async function fetchChatHistory(token) {
  const res = await fetch(`${API_BASE}/Chat/History`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load chat history');
  return JSON.parse(text);
}

// GET /api/chat/Dialog?sessionId=...
export async function fetchChatDialog(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/Dialog?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load chat dialog');
  return text;
}

// GET /api/chat/RetirementCalculatorInputs?sessionId=...&queryId=...
export async function fetchRetirementInputs(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/RetirementCalculatorInputs?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load retirement inputs');
  return JSON.parse(text);
}

// GET /api/chat/Chart?sessionId=...&queryId=...&chartType=...
export async function fetchChart(sessionId, queryId, chartType, token) {
  const res = await fetch(`${API_BASE}/Chat/Chart?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&chartType=${encodeURIComponent(chartType)}`, {
    headers: buildHeaders(token)
  });
  const blob = await res.blob();
  if (!res.ok) throw new Error('Failed to load chart');
  return blob;
}

// GET /api/chat/QueryStatus?sessionId=...&queryId=...
export async function fetchQueryStatus(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/QueryStatus?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  const trimmedText = text.trim();
  if (!res.ok) throw new Error('Failed to fetch query status');
  return trimmedText;
}

// GET /api/chat/FlowsTable?sessionId=...&queryId=...
export async function fetchFlowsTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/FlowsTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throw new Error('Failed to load flows table');
  return html;
}
