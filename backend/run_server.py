#!/usr/bin/env python3
"""
Simple startup script for the Vanilla RAG backend server.
Run this from the backend directory.
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Check if OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    print("ERROR: OPENAI_API_KEY environment variable is not set!")
    print("Please make sure your .env file contains a valid OpenAI API key.")
    print("Example: OPENAI_API_KEY=your_api_key_here")
    sys.exit(1)

if __name__ == "__main__":
    print("Starting Vanilla RAG Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("OpenAI API Key: " + os.getenv("OPENAI_API_KEY")[:20] + "...")
    
    # Use uvicorn with import string for proper reload support
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
