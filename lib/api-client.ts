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
  private refreshPromise: Promise<boolean> | null = null
  // Change this if your backend exposes a different refresh endpoint
  private REFRESH_ENDPOINT = "/token/refresh/"

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

        // If the access token is invalid/expired, attempt to refresh and retry once
        if (response.status === 401 && errorData?.code === "token_not_valid") {
          const refreshed = await this.attemptRefresh()
          if (refreshed) {
            // Retry original request once with the new token
            const retryResp = await fetch(url, {
              ...fetchOptions,
              headers: this.getHeaders(undefined, Boolean(skipAuth)),
              body: data ? JSON.stringify(data) : fetchOptions.body,
            })

            if (!retryResp.ok) {
              const retryError = await retryResp.json().catch(() => ({}))
              throw {
                message: retryError.error || "API request failed",
                status: retryResp.status,
                data: retryError,
              } as ApiError
            }

            return (await retryResp.json()) as T
          }
        }

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

  private async attemptRefresh(): Promise<boolean> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        if (!this.refreshToken) return false

        const url = `${API_BASE_URL}${this.REFRESH_ENDPOINT}`
        const resp = await fetch(url, {
          method: "POST",
          headers: this.getHeaders("application/json", true),
          body: JSON.stringify({ refresh: this.refreshToken }),
        })

        if (!resp.ok) {
          // refresh failed, clear tokens
          this.clearTokens()
          return false
        }

        const body = await resp.json().catch(() => ({}))
        if (body.access) {
          // Some backends return a new refresh token, others don't
          const newRefresh = body.refresh || this.refreshToken || ""
          this.setTokens(body.access, newRefresh)
          return true
        }

        this.clearTokens()
        return false
      } catch (err) {
        this.clearTokens()
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
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
