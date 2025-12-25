const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiRequest("/auth/me"),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest("/users/profile"),

  updateProfile: (data) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Upload profile photo using multipart/form-data
  uploadProfilePhoto: async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append("photo", file);

    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/users/profile/photo`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }

    return response.json();
  },

  addSkillHave: (skill) =>
    apiRequest("/users/skills/have", {
      method: "POST",
      body: JSON.stringify({ skill }),
    }),

  removeSkillHave: (skill) =>
    apiRequest(`/users/skills/have/${encodeURIComponent(skill)}`, {
      method: "DELETE",
    }),

  addSkillWant: (skill) =>
    apiRequest("/users/skills/want", {
      method: "POST",
      body: JSON.stringify({ skill }),
    }),

  removeSkillWant: (skill) =>
    apiRequest(`/users/skills/want/${encodeURIComponent(skill)}`, {
      method: "DELETE",
    }),
};

// Matches API
export const matchAPI = {
  findMatches: () => apiRequest("/matches"),
};

// Requests API
export const requestAPI = {
  getIncoming: () => apiRequest("/requests/incoming"),

  getOutgoing: () => apiRequest("/requests/outgoing"),

  createRequest: (data) =>
    apiRequest("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  acceptRequest: (id) =>
    apiRequest(`/requests/${id}/accept`, {
      method: "PUT",
    }),

  rejectRequest: (id) =>
    apiRequest(`/requests/${id}/reject`, {
      method: "PUT",
    }),
};

// Conversations API
export const conversationAPI = {
  createConversation: (partnerId) =>
    apiRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({ partnerId }),
    }),

  getConversations: (userId) => apiRequest(`/conversations/${userId}`),
};

// Messages API
export const messageAPI = {
  getMessages: (conversationId) => apiRequest(`/messages/${conversationId}`),

  sendMessage: (data) =>
    apiRequest("/messages/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Admin API
export const adminAPI = {
  getMetrics: () => apiRequest("/admin/metrics"),

  getUsers: () => apiRequest("/admin/users"),

  updateUserStatus: (id, status) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
