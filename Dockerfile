FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Commit directly to main.

Then repeat for `requirements.txt`:
```
fastapi
uvicorn
sympy
antlr4-python3-runtime==4.11.0
latex2sympy2
