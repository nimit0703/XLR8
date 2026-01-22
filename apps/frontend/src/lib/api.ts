import axios from 'axios'

// Create a standalone instance
const api = axios.create({
    baseURL:
        process.env.NODE_ENV === 'production'
            ? '/api'
            : 'http://localhost:3001/api', // Vite proxy will handle this
    withCredentials: true, // IMPORTANT: Allows sending the HTTPOnly cookie
})

// Queue to hold requests while token is refreshing
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// 1. Request Interceptor: Attach Access Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 2. Response Interceptor: Handle 403/401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is 401/403 and we haven't retried yet
        if (
            (error.response?.status === 403 ||
                error.response?.status === 401) &&
            !originalRequest._retry
        ) {
            // Prevent infinite loops
            if (originalRequest._retryCount >= 2) {
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            if (isRefreshing) {
                // If refreshing, add this request to queue and wait
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
            isRefreshing = true

            try {
                // Call the refresh endpoint
                // NOTE: We do NOT send the access token here, the cookie sends itself
                const { data } = await axios.get('/api/auth/refresh')

                const newToken = data.accessToken
                localStorage.setItem('accessToken', newToken)

                // Update header for the failed request
                api.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${newToken}`
                originalRequest.headers.Authorization = `Bearer ${newToken}`

                // Process all queued requests
                processQueue(null, newToken)
                isRefreshing = false

                // Return the original request (now with new token)
                return api(originalRequest)
            } catch (err) {
                processQueue(err, null)
                isRefreshing = false
                // If refresh fails, force logout
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)

export default api
