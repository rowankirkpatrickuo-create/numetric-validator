from fastapi import FastAPI
from pydantic import BaseModel
from sympy import simplify, sympify
from sympy.parsing.latex import parse_latex
import re

app = FastAPI()

class ValidateRequest(BaseModel):
    expr_a: str
    expr_b: str

class ValidateResponse(BaseModel):
    verdict: str  # "correct" | "needs_work" | "error"
    reason: str

def try_parse(expr: str):
    # Try LaTeX first
    try:
        return parse_latex(expr)
    except Exception:
        pass
    # Fall back to sympify with implicit multiplication
    try:
        expr = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', expr)
        expr = expr.replace('^', '**')
        return sympify(expr)
    except Exception:
        return None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/validate", response_model=ValidateResponse)
def validate(req: ValidateRequest):
    a = try_parse(req.expr_a)
    b = try_parse(req.expr_b)

    if a is None:
        return ValidateResponse(verdict="error", reason=f"Could not parse student input: {req.expr_a}")
    if b is None:
        return ValidateResponse(verdict="error", reason=f"Could not parse target expression: {req.expr_b}")

    try:
        diff = simplify(a - b)
        if diff == 0:
            return ValidateResponse(verdict="correct", reason="Expressions are mathematically equivalent.")
        else:
            return ValidateResponse(verdict="needs_work", reason=f"Difference: {diff}")
    except Exception as e:
        return ValidateResponse(verdict="error", reason=str(e))
