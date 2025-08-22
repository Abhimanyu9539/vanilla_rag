import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatInterface from './components/ChatInterface';
import { documentAPI, healthAPI } from './services/api';
import './index.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
    loadDocuments();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthAPI.checkHealth();
      setApiStatus('healthy');
    } catch (error) {
      setApiStatus('unhealthy');
      setError('Backend API is not available. Please make sure the server is running.');
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (document) => {
    setDocuments(prev => [...prev, document]);
    showNotification('Document uploaded successfully!', 'success');
  };

  const handleDocumentDeleted = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    showNotification('Document deleted successfully!', 'success');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    showNotification(errorMessage, 'error');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const clearError = () => {
    setError(null);
  };

  if (apiStatus === 'unhealthy') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Backend Unavailable</h1>
          <p className="text-gray-600 mb-4">
            The backend API is not running. Please start the FastAPI server first.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">To start the backend:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Navigate to the backend directory</li>
              <li>Install dependencies: <code className="bg-gray-200 px-1 rounded">pip install -r requirements.txt</code></li>
              <li>Set your OpenAI API key in a .env file</li>
              <li>Run: <code className="bg-gray-200 px-1 rounded">uvicorn app.main:app --reload</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vanilla RAG</h1>
                <p className="text-sm text-gray-600">Chat with your documents</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                apiStatus === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apiStatus === 'healthy' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{apiStatus === 'healthy' ? 'Connected' : 'Checking...'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Document Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Documents
              </h2>
              <FileUpload 
                onDocumentUploaded={handleDocumentUploaded}
                onError={handleError}
              />
            </div>

            {/* Document List */}
            <div className="card">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading documents...</p>
                </div>
              ) : (
                <DocumentList 
                  documents={documents}
                  onDocumentDeleted={handleDocumentDeleted}
                  onError={handleError}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="card h-[600px]">
              <ChatInterface documents={documents} />
            </div>
          </div>
        </div>
      </main>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 rounded-lg p-4 max-w-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`${
                notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
