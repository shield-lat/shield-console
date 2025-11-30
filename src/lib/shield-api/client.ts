/**
 * Shield Core API Client
 * 
 * A typed client for communicating with the Shield Core backend.
 * Handles authentication, request/response transformation, and error handling.
 */

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL || "http://localhost:8080";
const API_VERSION = "v1";

// Token storage key
const TOKEN_KEY = "shield_jwt_token";

// ============================================================================
// Types
// ============================================================================

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

// ============================================================================
// Token Management
// ============================================================================

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Make a request to the Shield Core API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, headers = {}, skipAuth = false } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}/${API_VERSION}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Make request
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle errors
  if (!response.ok) {
    let message = `Request failed: ${response.statusText}`;
    
    try {
      const errorBody = await response.json();
      message = errorBody.message || errorBody.error || message;
    } catch {
      // Ignore JSON parse errors
    }

    const error: ApiError = {
      status: response.status,
      message,
    };

    // Handle specific status codes
    if (response.status === 401) {
      clearToken();
      // Redirect to login if in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw error;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>) =>
    apiRequest<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

// ============================================================================
// Health Check
// ============================================================================

export interface HealthResponse {
  status: string;
  version: string;
  database: string;
  timestamp: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  return api.get<HealthResponse>("/health");
}

