import React, { useState } from 'react';
import { Trash2, File, Calendar, Hash } from 'lucide-react';
import { documentAPI } from '../services/api';

const DocumentList = ({ documents, onDocumentDeleted, onError }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(docId);
    try {
      await documentAPI.deleteDocument(docId);
      onDocumentDeleted(docId);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Delete failed';
      onError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    switch (extension) {
      case '.pdf':
        return '📄';
      case '.docx':
        return '📝';
      case '.txt':
        return '📄';
      default:
        return '📁';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
        <p className="text-gray-600">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Uploaded Documents ({documents.length})
      </h3>
      
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">
                  {getFileIcon(doc.filename)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {doc.filename}
                  </h4>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(doc.upload_date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Hash className="w-3 h-3" />
                      <span>{doc.chunks_count} chunks</span>
                    </div>
                    
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {doc.file_type.toUpperCase()}
                    </span>
                  </div>
                  
                  {doc.status && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'processed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Delete document"
              >
                {deletingId === doc.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
