const BASE_URL = '';

async function handleResponse(response) {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      if (body.message) {
        message = body.message;
      }
    } catch {
      // use statusText as fallback
    }
    throw new Error(message);
  }
  return response.json();
}

export async function fetchHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  return handleResponse(response);
}

export async function fetchSessions(signal) {
  const response = await fetch(`${BASE_URL}/api/sessions`, { signal });
  return handleResponse(response);
}

export async function createSession({ workDir, prompt, label, engine, yolo }) {
  const response = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workDir, prompt, label, engine, yolo }),
  });
  return handleResponse(response);
}

export async function killSession(id) {
  const response = await fetch(`${BASE_URL}/api/sessions/${id}/kill`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function closeSession(id) {
  const response = await fetch(`${BASE_URL}/api/sessions/${id}/close`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function getEngines() {
  const response = await fetch(`${BASE_URL}/api/engines`);
  return handleResponse(response);
}

export async function browsePath(dirPath) {
  const params = dirPath ? `?path=${encodeURIComponent(dirPath)}` : '';
  const response = await fetch(`${BASE_URL}/api/browse${params}`);
  return handleResponse(response);
}

export async function browseRoots() {
  const response = await fetch(`${BASE_URL}/api/browse/roots`);
  return handleResponse(response);
}
