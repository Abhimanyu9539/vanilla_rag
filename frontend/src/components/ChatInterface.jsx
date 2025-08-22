import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';
import { chatAPI } from '../services/api';

const ChatInterface = ({ documents }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        sources: response.sources || [],
        confidence: response.confidence || 0,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.response?.data?.detail || 'Failed to get response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : isError 
                ? 'bg-red-500 text-white'
                : 'bg-gray-600 text-white'
          }`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : isError ? (
              <Bot className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          
          <div className={`mx-3 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`px-4 py-2 rounded-lg ${
              isUser 
                ? 'bg-primary-600 text-white' 
                : isError 
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Confidence Score */}
              {message.confidence !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">Chat with Documents</h3>
        <p className="text-sm text-gray-600">
          {documents.length > 0 
            ? `Ask questions about your ${documents.length} uploaded document${documents.length > 1 ? 's' : ''}`
            : 'Upload documents to start chatting'
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600">
              {documents.length > 0 
                ? 'Ask questions about your uploaded documents'
                : 'Upload some documents first to start chatting'
              }
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="mx-3">
                <div className="px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={documents.length > 0 ? "Ask a question about your documents..." : "Upload documents to start chatting..."}
            disabled={isLoading || documents.length === 0}
            className="flex-1 input-field disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || documents.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
