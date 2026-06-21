from fastapi import APIRouter, HTTPException

from data.store import artigo_store
from schemas import ArtigoSchema

router = APIRouter(prefix="/api/artigos", tags=["artigos"])


@router.get("", response_model=list[ArtigoSchema])
def listar_artigos(q: str | None = None, limit: int = 50):
    """Lista os artigos do Código Civil.

    Aceita um termo de pesquisa opcional (`q`) que procura no título e no
    corpo do artigo. O `limit` evita devolver toda a base de uma só vez.
    """
    artigos = artigo_store.search(q) if q else artigo_store.all()
    return artigos[: max(0, limit)]


@router.get("/{artigo_id}", response_model=ArtigoSchema)
def obter_artigo(artigo_id: int):
    artigo = artigo_store.get(artigo_id)
    if artigo is None:
        raise HTTPException(status_code=404, detail="Artigo não encontrado.")
    return artigo
