FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt huggingface_hub

COPY backend/app/ ./app/

ARG HF_TOKEN
ENV HF_TOKEN=$HF_TOKEN
COPY backend/download_model.py .
RUN python3 download_model.py

ENV PYTHONPATH=/app
ENV MODEL_PATH=/app/models/crop_health_model_fixed.h5

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
