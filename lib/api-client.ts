// API client with JWT token management and bilingual support

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

export interface ApiError {
  message: string
  status: number
  data?: Record<string, unknown>
}

export class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  setTokens(access: string, refresh: string) {
    this.accessToken = access
    this.refreshToken = refresh
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
  }

  loadTokens() {
    this.accessToken = localStorage.getItem("accessToken")
    this.refreshToken = localStorage.getItem("refreshToken")
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  private getHeaders(contentType = "application/json", skipAuth = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": contentType,
    }

    if (!skipAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { data?: Record<string, unknown>; skipAuth?: boolean } = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const { data, skipAuth, ...fetchOptions } = options

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders(undefined, Boolean(skipAuth)),
        body: data ? JSON.stringify(data) : fetchOptions.body,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.error || "API request failed",
          status: response.status,
          data: errorData,
        } as ApiError
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: "Network error",
          status: 0,
        } as ApiError
      }
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", data })
  }

  /**
   * Post without including the Authorization header. Useful for login endpoints
   * where a stale/invalid token in localStorage would otherwise trigger a 401.
   */
  async unauthenticatedPost<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", data, skipAuth: true })
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", data })
  }

  async patch<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", data })
  }

  // Public helper so consumers can check whether an access token was loaded
  hasAccessToken(): boolean {
    return !!this.accessToken
  }
}

export const apiClient = new ApiClient()
