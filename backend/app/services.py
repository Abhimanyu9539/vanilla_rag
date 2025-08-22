import os
import chromadb
from chromadb.config import Settings
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain_chroma import Chroma
from langchain.memory import ConversationBufferMemory
from typing import List, Dict, Any
import json
from datetime import datetime

# Try relative imports first, fallback to absolute imports
try:
    from .utils import (
        extract_text_from_file, 
        chunk_text, 
        generate_document_id,
        get_file_extension,
        is_supported_file_type
    )
    from .models import Document, ChatResponse
except ImportError:
    from utils import (
        extract_text_from_file, 
        chunk_text, 
        generate_document_id,
        get_file_extension,
        is_supported_file_type
    )
    from models import Document, ChatResponse

class RAGService:
    def __init__(self):
        self.upload_dir = "uploads"
        self.documents_db = {}
        self.vector_store = None
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(temperature=0.7)
        # Initialize memory for conversation history
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"  # Explicitly set the output key
        )
        self._initialize_vector_store()
    
    def _initialize_vector_store(self):
        """Initialize ChromaDB vector store"""
        try:
            # Initialize ChromaDB client
            chroma_client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(anonymized_telemetry=False)
            )
            
            # Create or get collection
            self.collection = chroma_client.get_or_create_collection(
                name="documents",
                metadata={"hnsw:space": "cosine"}
            )
            
            # Initialize LangChain vector store
            self.vector_store = Chroma(
                client=chroma_client,
                collection_name="documents",
                embedding_function=self.embeddings
            )
            
        except Exception as e:
            print(f"Error initializing vector store: {e}")
            # Fallback to in-memory storage
            self.vector_store = None
    
    def process_document(self, file_path: str, filename: str) -> Document:
        """Process uploaded document and store in vector database"""
        try:
            # Check file type
            if not is_supported_file_type(filename):
                raise Exception(f"Unsupported file type: {get_file_extension(filename)}")
            
            # Extract text
            file_type = get_file_extension(filename)[1:]  # Remove the dot
            text = extract_text_from_file(file_path, file_type)
            
            if not text.strip():
                raise Exception("No text content found in document")
            
            # Generate document ID
            doc_id = generate_document_id()
            
            # Chunk text
            chunks = chunk_text(text)
            
            # Store in vector database
            if self.vector_store:
                # Add documents to vector store
                self.vector_store.add_texts(
                    texts=chunks,
                    metadatas=[{"source": filename, "doc_id": doc_id} for _ in chunks],
                    ids=[f"{doc_id}_{i}" for i in range(len(chunks))]
                )
            
            # Create document record
            document = Document(
                id=doc_id,
                filename=filename,
                file_type=file_type,
                upload_date=datetime.now(),
                chunks_count=len(chunks),
                status="processed"
            )
            
            # Store document metadata
            self.documents_db[doc_id] = document
            
            return document
            
        except Exception as e:
            raise Exception(f"Error processing document: {str(e)}")
    
    def get_documents(self) -> List[Document]:
        """Get list of all processed documents"""
        return list(self.documents_db.values())
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete document from vector store and metadata"""
        try:
            if doc_id in self.documents_db:
                # Remove from vector store
                if self.vector_store:
                    # Get all documents with this doc_id
                    results = self.vector_store.get(
                        where={"doc_id": doc_id}
                    )
                    if results and results['ids']:
                        self.vector_store.delete(ids=results['ids'])
                
                # Remove from metadata
                del self.documents_db[doc_id]
                return True
            return False
        except Exception as e:
            raise Exception(f"Error deleting document: {str(e)}")
    
    def chat(self, message: str, document_ids: List[str] = None) -> ChatResponse:
        """Generate chat response using RAG"""
        try:
            if not self.vector_store:
                return ChatResponse(
                    response="Vector store not initialized. Please upload some documents first.",
                    sources=[],
                    confidence=0.0
                )
            
            # Create conversational retrieval chain
            qa_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
                memory=self.memory,
                return_source_documents=True,
                verbose=True
            )
            
            # Get response from the chain
            result = qa_chain.invoke({"question": message})
            
            # Extract answer and source documents
            answer = result.get("answer", "I couldn't generate a response.")
            source_documents = result.get("source_documents", [])
            
            # Extract sources
            sources = []
            if source_documents:
                for doc in source_documents:
                    if hasattr(doc, 'metadata') and doc.metadata.get('source'):
                        sources.append(doc.metadata['source'])
            
            return ChatResponse(
                response=answer,
                sources=list(set(sources)),  # Remove duplicates
                confidence=0.8  # Placeholder confidence score
            )
            
        except Exception as e:
            return ChatResponse(
                response=f"Error generating response: {str(e)}",
                sources=[],
                confidence=0.0
            )

    def is_supported_file_type(self, filename: str) -> bool:
        """Check if file type is supported"""
        supported_extensions = ['.pdf', '.docx', '.txt']
        return get_file_extension(filename) in supported_extensions

# Global service instance
rag_service = RAGService()
