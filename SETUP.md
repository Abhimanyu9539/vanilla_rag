# Vanilla RAG Setup Guide

This guide will help you set up and run the Vanilla RAG project on your local machine.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key

## Quick Start

### 1. Clone or Download the Project

Make sure you have all the project files in your workspace.

### 2. Set Up the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_actual_openai_api_key_here
     ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### 3. Set Up the Frontend

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Using Windows Batch Files (Windows Users)

If you're on Windows, you can use the provided batch files for easier setup:

1. **Start the backend:**
   - Double-click `start_backend.bat`
   - This will install dependencies and start the server

2. **Start the frontend:**
   - Double-click `start_frontend.bat`
   - This will install dependencies and start the development server

## Testing the Application

1. **Open your browser and go to `http://localhost:3000`**

2. **Upload a document:**
   - Use the drag-and-drop area or click to browse
   - Supported formats: PDF, DOCX, TXT
   - Try uploading the included `sample_document.txt`

3. **Start chatting:**
   - Once a document is uploaded, you can ask questions about it
   - The AI will respond based on the document content
   - Sources will be shown for transparency

## API Endpoints

The backend provides the following endpoints:

- `GET /` - Health check
- `GET /health` - API status
- `POST /upload` - Upload documents
- `GET /documents` - List uploaded documents
- `DELETE /documents/{doc_id}` - Delete a document
- `POST /chat` - Send chat messages

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Make sure you have Python 3.8+ installed
   - Check that all dependencies are installed
   - Verify your OpenAI API key is set correctly

2. **Frontend won't start:**
   - Make sure you have Node.js 16+ installed
   - Check that all npm dependencies are installed
   - Ensure port 3000 is not in use

3. **Upload fails:**
   - Check file format (PDF, DOCX, TXT only)
   - Ensure file size is under 10MB
   - Verify backend is running

4. **Chat not working:**
   - Make sure you have uploaded at least one document
   - Check that your OpenAI API key is valid
   - Verify backend is accessible from frontend

### Getting Help

- Check the browser console for frontend errors
- Check the terminal running the backend for server errors
- Ensure both frontend and backend are running simultaneously

## Project Structure

```
vanilla_rag/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Data models
│   │   ├── services.py     # RAG business logic
│   │   └── utils.py        # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS config
├── sample_document.txt     # Test document
├── start_backend.bat       # Windows backend starter
├── start_frontend.bat      # Windows frontend starter
└── README.md              # Project overview
```

## Next Steps

Once the basic setup is working, you can:

1. **Customize the AI model** by modifying the model parameters in `backend/app/services.py`
2. **Add more document types** by extending the text extraction functions in `backend/app/utils.py`
3. **Improve the UI** by modifying the React components in `frontend/src/components/`
4. **Add authentication** for multi-user support
5. **Deploy to production** using cloud services

## Support

If you encounter any issues, please check:
1. All prerequisites are installed
2. Environment variables are set correctly
3. Both frontend and backend are running
4. Network connectivity and firewall settings
