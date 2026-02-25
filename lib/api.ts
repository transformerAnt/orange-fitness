const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/'/g, '').trim();

type ApiResult<T> = { data: T | null; error?: string };

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  if (!apiBaseUrl) {
    return { data: null, error: 'API base URL not configured' };
  }
  try {
    const response = await fetch(`${apiBaseUrl}${path}`);
    const contentType = response.headers.get('content-type');
    
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      return { data: null, error: `Invalid response format: ${response.status} ${text.slice(0, 100)}` };
    }

    if (!response.ok) {
      return { data, error: data?.error ?? `Request failed: ${response.status}` };
    }
    return { data };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  if (!apiBaseUrl) {
    return { data: null, error: 'API base URL not configured' };
  }
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    let data: any = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      return { data: null, error: `Invalid response format: ${response.status} ${text.slice(0, 100)}` };
    }

    if (!response.ok) {
      return { data, error: data?.error ?? `Request failed: ${response.status}` };
    }
    return { data };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
