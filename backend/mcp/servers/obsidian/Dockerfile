FROM python:3.10-slim

WORKDIR /app

RUN pip install fastapi uvicorn pydantic chromadb sentence-transformers

COPY obsidian_server.py /app/main.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
