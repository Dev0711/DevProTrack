import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8082",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  connectGithub: (data) => api.post("/auth/github/connect", data),
};

export const repositoryAPI = {
  getAll: () => api.get("/api/repositories"),
  getById: (id) => api.get(`/api/repositories/${id}`),
  syncGithub: () => api.post("/api/repositories/sync/github"),
  syncRepository: (fullName) => api.post(`/api/repositories/sync/${fullName}`),
  syncAll: () => api.post("/api/repositories/sync/all"),
  toggleActive: (id, active) => api.put(`/api/repositories/${id}/active?active=${active}`),
};

export const analyticsAPI = {
  getDashboard: (startDate, endDate) => {
    let url = "/api/analytics/dashboard";
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get(url);
  },
  getRepositoryCommits: (id, startDate, endDate) => {
    let url = `/api/analytics/repository/${id}/commits`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get(url);
  },
  getRepositoryPullRequests: (id, startDate, endDate) => {
    let url = `/api/analytics/repository/${id}/pull-requests`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return api.get(url);
  },
};

export default api;
