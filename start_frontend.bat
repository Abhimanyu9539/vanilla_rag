@echo off
echo Starting Vanilla RAG Frontend...
echo.

cd frontend

echo Installing dependencies...
npm install

echo.
echo Starting React development server...
echo The app will open at http://localhost:3000
echo.
npm start

pause
