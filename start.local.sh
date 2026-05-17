#!/bin/bash

echo "Starting Crop Health Monitoring System..."

# Start backend
echo "Starting backend server..."
cd backend
if [ -x "../.venv/bin/python" ]; then
  PYTHONPATH=. ../.venv/bin/python -m uvicorn app.main:app --reload --port 8000 &
else
  PYTHONPATH=. python3 -m uvicorn app.main:app --reload --port 8000 &
fi
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Servers started"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
