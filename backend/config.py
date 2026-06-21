import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


class Settings:
    """Configurações da aplicação.

    Os artigos do Código Civil são carregados a partir do dump SQL
    (`SQL_DUMP_PATH`) para memória — não há base de dados. A API expõe apenas
    o chatbot (e consulta de artigos) com conversa contínua.
    """

    API_TITLE: str = "Código Civil Chatbot Rest API"
    API_VERSION: str = "v1"

    # Fonte dos artigos (dump SQL carregado em memória)
    SQL_DUMP_PATH: str = os.environ.get(
        "SQL_DUMP_PATH", str(BASE_DIR / "data" / "chatbot.sql")
    )

    # Chatbot (Gemini)
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


settings = Settings()
# Alias para compatibilidade com a estrutura original (config.Config)
Config = settings
