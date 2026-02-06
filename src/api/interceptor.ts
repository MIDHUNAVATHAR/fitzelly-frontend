import { axiosInstance } from "./axios";

type QueueItem = {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;


const processQueue = (error: Error | null, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    })
    failedQueue = [];
}


export const setupInterceptors = (getAccessToken: () => string | null, setAccessToken: (token: string | null) => void) => {

    if (requestInterceptor !== null) axiosInstance.interceptors.request.eject(requestInterceptor);
    if (responseInterceptor !== null) axiosInstance.interceptors.response.eject(responseInterceptor);

    requestInterceptor = axiosInstance.interceptors.request.use((config) => {
        const token = getAccessToken();  //take token from auth context. 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    })

    responseInterceptor = axiosInstance.interceptors.response.use(res => res, async error => {
        const originalRequest = error.config;

        const isAuthRoute = originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh-token") ||
            originalRequest.url.includes("/auth/logout") ||
            originalRequest.url.includes("/auth/forgot-password/initiate")

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {

            if (isRefreshing) {

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest)
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axiosInstance.get("/api/auth/refresh-token");

                const newToken = res.data.data.accessToken;

                setAccessToken(newToken);
                processQueue(null, newToken)

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                const errObj = err instanceof Error ? err : new Error("refresh token failed")
                processQueue(errObj, null);
                setAccessToken(null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    })

}