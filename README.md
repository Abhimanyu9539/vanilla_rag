# Vanilla RAG Project

A Retrieval-Augmented Generation (RAG) application that allows users to upload documents and chat with them using AI.

## Features

- **Document Upload**: Upload PDF, TXT, and DOCX files
- **Document Processing**: Automatic text extraction and chunking
- **Vector Storage**: Store document embeddings for efficient retrieval
- **Chat Interface**: Interactive chat with uploaded documents
- **Real-time Responses**: Get AI-generated responses based on document content

## Project Structure

```
vanilla_rag/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Data models
│   │   ├── services.py     # Business logic
│   │   └── utils.py        # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── uploads/           # Document storage
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app component
│   ├── package.json       # Node.js dependencies
│   └── index.html
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Upload documents using the file upload interface
3. Wait for document processing to complete
4. Start chatting with your documents!

## API Endpoints

- `POST /upload` - Upload documents
- `GET /documents` - List uploaded documents
- `POST /chat` - Send chat messages
- `DELETE /documents/{doc_id}` - Delete a document

## Technologies Used

### Backend
- FastAPI
- LangChain
- ChromaDB (vector database)
- PyPDF2 (PDF processing)
- python-docx (DOCX processing)

### Frontend
- React 18
- Axios (HTTP client)
- Tailwind CSS (styling)
- React Dropzone (file upload)

## Environment Variables

Create a `.env` file in the backend directory:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## License

MIT
