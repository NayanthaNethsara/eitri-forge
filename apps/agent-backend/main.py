from fastapi import FastAPI

app = FastAPI(title="Eitri Forge Agent Backend")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent-backend"}
