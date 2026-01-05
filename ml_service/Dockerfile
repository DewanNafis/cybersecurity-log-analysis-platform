FROM python:3.11-slim

WORKDIR /app

# Faster + smaller install
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY ml_service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY ml_service /app/ml_service

# Models will be mounted at /app/ml_service/models
ENV ML_MODELS_DIR=/app/ml_service/models

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "ml_service.app:app", "--host", "0.0.0.0", "--port", "8000"]
