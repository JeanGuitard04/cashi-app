const API_BASE_URL = "http://cashi-api.antakarana.ai";

type JsonBody = Record<string, unknown> | unknown[];

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: JsonBody | FormData;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const { method, body, token } = options;
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData
        ? body
        : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    });
  } catch {
    throw new Error("Error de conexión");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const responseBody = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new Error(responseBody?.error ?? `Error ${response.status}`);
  }

  return responseBody as T;
}

export const apiService = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body?: JsonBody | FormData, token?: string) =>
    request<T>(path, { method: "POST", body, token }),
  patch: <T>(path: string, body?: JsonBody, token?: string) =>
    request<T>(path, { method: "PATCH", body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
};

export { API_BASE_URL };
