import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { documentAPI } from '../services/api';

const FileUpload = ({ onDocumentUploaded, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const file = acceptedFiles[0];
      
      // Validate file type
      const allowedTypes = ['.pdf', '.docx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type. Please upload PDF, DOCX, or TXT files.`);
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload files smaller than 10MB.');
      }

      const document = await documentAPI.uploadDocument(file);
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${file.name}`,
        document
      });
      
      onDocumentUploaded(document);
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed';
      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
      onError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [onDocumentUploaded, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: uploading
  });

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

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload a document'}
            </h3>
            <p className="text-gray-600">
              Drag and drop a PDF, DOCX, or TXT file here, or click to browse
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            Maximum file size: 10MB
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {uploadStatus.message}
          </span>
          <button
            onClick={() => setUploadStatus(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Processing document...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
