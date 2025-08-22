import PyPDF2
import docx
import os
from typing import List, Tuple
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid
from datetime import datetime

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        raise Exception(f"Error extracting text from TXT: {str(e)}")

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from file based on file type"""
    if file_type.lower() == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type.lower() == 'docx':
        return extract_text_from_docx(file_path)
    elif file_type.lower() == 'txt':
        return extract_text_from_txt(file_path)
    else:
        raise Exception(f"Unsupported file type: {file_type}")

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Split text into chunks for vector storage"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    return text_splitter.split_text(text)

def generate_document_id() -> str:
    """Generate a unique document ID"""
    return str(uuid.uuid4())

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower()

def is_supported_file_type(filename: str) -> bool:
    """Check if file type is supported"""
    supported_extensions = ['.pdf', '.docx', '.txt']
    return get_file_extension(filename) in supported_extensions

def save_uploaded_file(upload_dir: str, filename: str, content: bytes) -> str:
    """Save uploaded file to disk"""
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, 'wb') as f:
        f.write(content)
    return file_path
