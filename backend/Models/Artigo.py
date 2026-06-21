from dataclasses import dataclass
from typing import Optional


@dataclass
class Artigo:
    """Artigo do Código Civil carregado a partir do dump SQL (sem base de dados)."""

    id: int
    capitulo_id: Optional[int]
    artigo: str
    corpo: Optional[str] = None

    def format(self):
        return {
            "id": self.id,
            "capitulo_id": self.capitulo_id,
            "artigo": self.artigo,
            "corpo": self.corpo,
        }
