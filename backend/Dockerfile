FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt huggingface_hub

COPY app/ ./app/

RUN python3 -c "\
from huggingface_hub import hf_hub_download; \
hf_hub_download(repo_id='efaxale/crop-health-model', filename='crop_health_model_fixed.h5', local_dir='/app/models')"

ENV PYTHONPATH=/app
ENV MODEL_PATH=/app/models/crop_health_model_fixed.h5

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]