const pendingRequests = new Map<string, AbortController>();

function getRequestKey(method: string, url: string): string {
  return `${method}:${url}`;
}

export function cancelDuplicateRequest(method: string, url: string): AbortSignal {
  const key = getRequestKey(method, url);
  const existing = pendingRequests.get(key);
  if (existing) existing.abort();

  const controller = new AbortController();
  pendingRequests.set(key, controller);
  return controller.signal;
}

export function clearPendingRequest(method: string, url: string): void {
  pendingRequests.delete(getRequestKey(method, url));
}
