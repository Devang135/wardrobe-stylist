import type { ApiErrorShape } from '@/types';

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = 'ApiError';
    this.status = shape.status;
    this.code = shape.code;
    this.details = shape.details;
  }
}

type TokenProvider = () => string | null;

let tokenProvider: TokenProvider = () => {
  try {
    return window.localStorage.getItem('wardrobe_ai_token');
  } catch {
    return null;
  }
};

export function setAuthTokenProvider(fn: TokenProvider): void {
  tokenProvider = fn;
}

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

function mapStatusMessage(status: number, serverMessage?: string): string {
  if (serverMessage) return serverMessage;
  switch (status) {
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource could not be found.';
    case 422:
      return 'Please check the highlighted input fields and try again.';
    default:
      return status >= 500
        ? 'The server encountered an unexpected error. Please try again shortly.'
        : 'Request failed.';
  }
}

export async function httpRequest<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const { body, timeoutMs = 15000, headers: customHeaders, signal, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const combinedSignal = signal ?? controller.signal;
  const token = tokenProvider();

  const headers = new Headers(customHeaders);
  if (!(body instanceof FormData) && body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      signal: combinedSignal,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? ((await response.json()) as Record<string, unknown>) : undefined;

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        code: typeof payload?.code === 'string' ? payload.code : `HTTP_${response.status}`,
        message: mapStatusMessage(
          response.status,
          typeof payload?.message === 'string' ? payload.message : undefined,
        ),
        details:
          payload?.details && typeof payload.details === 'object'
            ? (payload.details as Record<string, string>)
            : undefined,
      });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return payload as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError({
        status: 408,
        code: 'REQUEST_TIMEOUT',
        message: 'The request timed out. Please try again.',
      });
    }
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the backend server.',
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
