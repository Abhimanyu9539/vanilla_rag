from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import tempfile
from typing import List
import uvicorn
from dotenv import load_dotenv

# Try relative imports first, fallback to absolute imports
try:
    from .models import Document, ChatMessage, ChatResponse, DocumentList, ErrorResponse
    from .services import rag_service
    from .utils import save_uploaded_file
except ImportError:
    from models import Document, ChatMessage, ChatResponse, DocumentList, ErrorResponse
    from services import rag_service
    from utils import save_uploaded_file

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Vanilla RAG API",
    description="A RAG (Retrieval-Augmented Generation) API for document chat",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Vanilla RAG API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "vanilla-rag-api"}

@app.post("/upload", response_model=Document)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check if file type is supported
        if not rag_service.is_supported_file_type(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Supported types: PDF, DOCX, TXT"
            )
        
        # Read file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process document
            document = rag_service.process_document(temp_file_path, file.filename)
            return document
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.get("/documents", response_model=DocumentList)
async def get_documents():
    """Get list of all uploaded documents"""
    try:
        documents = rag_service.get_documents()
        return DocumentList(documents=documents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {str(e)}")

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document"""
    try:
        success = rag_service.delete_document(doc_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_documents(message: ChatMessage):
    """Chat with uploaded documents"""
    try:
        if not message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        response = rag_service.chat(message.message, message.document_ids)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc)
        ).dict()
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
