import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const documentAPI = {
  // Upload a document
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Delete a document
  deleteDocument: async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },
};

export const chatAPI = {
  // Send a chat message
  sendMessage: async (message, documentIds = null) => {
    const response = await api.post('/chat', {
      message,
      document_ids: documentIds,
    });
    return response.data;
  },
};

export const healthAPI = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
