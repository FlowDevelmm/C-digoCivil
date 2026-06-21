from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from Controllers.ChatbotController import router as chatbot_router
from data.store import artigo_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Carrega os artigos do Código Civil a partir do dump SQL para memória
    total = artigo_store.load()
    print(f"[startup] {total} artigos carregados de {settings.SQL_DUMP_PATH}")
    yield


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router)


@app.get("/", tags=["root"])
def root():
    return {
        "message": settings.API_TITLE,
        "version": settings.API_VERSION,
        "artigos_carregados": artigo_store.count(),
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5500, reload=True)
