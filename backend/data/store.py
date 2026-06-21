"""
store.py

Repositório em memória dos artigos do Código Civil. Carrega os dados a partir
do dump SQL na inicialização da aplicação e expõe as consultas usadas pelos
serviços (substitui o `Artigo.query` do SQLAlchemy do projecto original).
"""
import unicodedata
from pathlib import Path

from config import settings
from data.sql_loader import parse_table
from Models.Artigo import Artigo

# Palavras muito comuns (ou pouco discriminativas no domínio jurídico) que são
# ignoradas na pesquisa por palavras-chave.
STOPWORDS = {
    "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos",
    "das", "em", "no", "na", "nos", "nas", "ao", "aos", "e", "ou", "que", "se",
    "sobre", "para", "por", "com", "sem", "me", "te", "lhe", "nos", "vos", "eu",
    "tu", "ele", "ela", "fala", "diz", "dizer", "lei", "leis", "isso", "isto",
    "aquilo", "qual", "quais", "como", "quando", "onde", "porque", "porquê",
    "sua", "seu", "suas", "seus", "meu", "minha", "este", "esta", "esse", "essa",
    "é", "ser", "está", "são", "ha", "há", "the", "what", "of", "olá", "ola",
    "oie", "oi", "bom", "boa", "dia", "tarde", "noite", "obrigado", "obrigada",
    "favor", "pode", "podes", "quero", "queria", "gostava", "saber", "explica",
    "explicar", "mais", "muito", "tudo", "algo", "alguma", "algum", "todo",
    "toda", "nao", "não", "sim", "também", "tambem",
}


def _normalize(text: str) -> str:
    """Minúsculas + remoção de acentos, para uma pesquisa robusta."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower()


def _tokenize(text: str) -> list[str]:
    """Extrai palavras-chave relevantes de uma frase."""
    norm = _normalize(text)
    tokens = []
    for raw in "".join(c if c.isalnum() else " " for c in norm).split():
        if len(raw) >= 3 and raw not in STOPWORDS:
            tokens.append(raw)
    return tokens


class ArtigoStore:
    def __init__(self):
        self._artigos: list[Artigo] = []
        # Índice paralelo com texto normalizado: (artigo, artigo_norm, corpo_norm)
        self._index: list[tuple[Artigo, str, str]] = []
        self._loaded = False

    def load(self, sql_path: str | None = None):
        path = Path(sql_path or settings.SQL_DUMP_PATH)
        if not path.exists():
            raise FileNotFoundError(f"Dump SQL não encontrado: {path}")

        try:
            sql_text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            sql_text = path.read_text(encoding="latin-1")

        rows = parse_table(sql_text, "artigos")
        # Colunas: (id, capitulo_id, artigo, corpo)
        self._artigos = [
            Artigo(
                id=row[0],
                capitulo_id=row[1],
                artigo=row[2],
                corpo=row[3] if len(row) > 3 else None,
            )
            for row in rows
        ]
        self._index = [
            (a, _normalize(a.artigo or ""), _normalize(a.corpo or ""))
            for a in self._artigos
        ]
        self._loaded = True
        return len(self._artigos)

    @property
    def loaded(self) -> bool:
        return self._loaded

    def all(self) -> list[Artigo]:
        return list(self._artigos)

    def count(self) -> int:
        return len(self._artigos)

    def get(self, artigo_id: int) -> Artigo | None:
        return next((a for a in self._artigos if a.id == artigo_id), None)

    def ilike_artigo(self, pattern: str) -> list[Artigo]:
        """Equivalente a `Artigo.artigo.ilike('%pattern%')` (sem acentos)."""
        p = _normalize(pattern)
        return [a for (a, art, _) in self._index if p in art]

    def search(self, keyword: str) -> list[Artigo]:
        """Substring simples em artigo OU corpo (sem acentos)."""
        k = _normalize(keyword)
        return [a for (a, art, corpo) in self._index if k in art or k in corpo]

    def search_relevant(self, query: str, limit: int = 12) -> list[Artigo]:
        """Pesquisa por palavras-chave com pontuação.

        Divide a pergunta em palavras-chave e pontua cada artigo pelo número de
        ocorrências (peso maior no título do artigo). Devolve os mais relevantes.
        """
        tokens = _tokenize(query)
        if not tokens:
            return []

        scored: list[tuple[int, Artigo]] = []
        for artigo, art_norm, corpo_norm in self._index:
            score = 0
            for tok in tokens:
                if tok in art_norm:
                    score += 5 + art_norm.count(tok)
                if tok in corpo_norm:
                    score += corpo_norm.count(tok)
            if score > 0:
                scored.append((score, artigo))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [a for _, a in scored[:limit]]


# Instância única partilhada pela aplicação.
artigo_store = ArtigoStore()
