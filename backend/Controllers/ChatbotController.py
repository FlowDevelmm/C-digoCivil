from fastapi import APIRouter, HTTPException

from schemas import ChatbotRequest, ChatbotResponse
from Services.ChatbotService import ChatbotService

router = APIRouter(tags=["chatbot"])


@router.post("/api/chatbot", response_model=ChatbotResponse)
def chatbot(payload: ChatbotRequest):
    query = (payload.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="A pergunta não pode estar vazia.")

    chatbot_service = ChatbotService()
    return chatbot_service.chatbot_query(query, payload.history)
