from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class DocumentUpload(BaseModel):
    filename: str
    content: str
    file_type: str

class Document(BaseModel):
    id: str
    filename: str
    file_type: str
    upload_date: datetime
    chunks_count: int
    status: str = "processed"

class ChatMessage(BaseModel):
    message: str
    document_ids: Optional[List[str]] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    confidence: float = 0.0

class DocumentList(BaseModel):
    documents: List[Document]

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
