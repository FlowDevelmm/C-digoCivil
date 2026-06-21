from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Chatbot
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatbotRequest(BaseModel):
    query: str
    # Histórico da conversa para manter o contexto contínuo
    history: List[ChatMessage] = []


class ChatbotResponse(BaseModel):
    response: str


# ---------------------------------------------------------------------------
# Artigo
# ---------------------------------------------------------------------------
class ArtigoSchema(BaseModel):
    # Permite ler os campos a partir do dataclass `Artigo` (sem base de dados).
    model_config = ConfigDict(from_attributes=True)

    id: int
    capitulo_id: Optional[int] = None
    artigo: str
    corpo: Optional[str] = None
