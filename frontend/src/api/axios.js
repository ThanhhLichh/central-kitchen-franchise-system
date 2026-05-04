import axios from "axios";

const axiosClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, newToken = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(newToken);
    }
  });

  refreshQueue = [];
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login") &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      const oldToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!oldToken || !refreshToken) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_GATEWAY}/api/auth/refresh`,
          {
            token: oldToken,
            refreshToken: refreshToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const newToken = response.data.token;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem("token", newToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;