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
  getReadme: (fullName) => api.get(`/api/repositories/${encodeURIComponent(fullName)}/readme`),
  
  // Direct GitHub fallback method
  getReadmeDirectFromGitHub: async (fullName) => {
    const [owner, repo] = fullName.split('/');
    // Try both main and master branches with different README filenames
    const branches = ['main', 'master'];
    const fileNames = ['README.md', 'readme.md', 'README.markdown'];
    
    for (const branch of branches) {
      for (const fileName of fileNames) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileName}`;
          const response = await fetch(rawUrl);
          if (response.ok) {
            return { data: await response.text() };
          }
        } catch (err) {
          console.log(`Failed direct GitHub fetch: ${branch}/${fileName}`);
        }
      }
    }
    
    throw new Error('No README found on GitHub');
  }
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
