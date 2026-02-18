const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

type ApiResult<T> = { data: T; error?: string };

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  if (!apiBaseUrl) {
    return { data: undefined as T, error: 'API base URL not configured' };
  }
  const response = await fetch(`${apiBaseUrl}${path}`);
  const data = await response.json();
  if (!response.ok) {
    return { data, error: data?.error ?? 'Request failed' };
  }
  return { data };
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  if (!apiBaseUrl) {
    return { data: undefined as T, error: 'API base URL not configured' };
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    return { data, error: data?.error ?? 'Request failed' };
  }
  return { data };
}
