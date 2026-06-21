# Código Civil — Chatbot API (FastAPI)

API do chatbot do Código Civil de Moçambique, em **FastAPI**. Mantém a estrutura
do projecto original (`Controllers/`, `Models/`, `Services/`), mas focada apenas
no chatbot.

## Como funciona

- **Sem base de dados.** Os artigos do Código Civil são carregados a partir do
  dump `data/chatbot.sql` para **memória** no arranque
  (ver [data/sql_loader.py](data/sql_loader.py) e [data/store.py](data/store.py)).
- **Conversa contínua.** O endpoint aceita o histórico da conversa para manter o
  contexto entre mensagens.
- **Respostas em Markdown sem asteriscos**, geradas pelo Google Gemini com base
  exclusiva nos artigos recuperados.

## Estrutura

```
backend/
├── main.py                  # App FastAPI
├── config.py                # Configurações (Gemini, caminho do dump)
├── schemas.py               # Modelos Pydantic (pedido/resposta do chat)
├── data/
│   ├── chatbot.sql          # Dump com os artigos do Código Civil
│   ├── sql_loader.py        # Parser do dump SQL
│   └── store.py             # Repositório em memória dos artigos
├── Models/
│   └── Artigo.py            # Dataclass do artigo
├── Services/
│   └── ChatbotService.py    # Pesquisa de artigos + Gemini
└── Controllers/
    └── ChatbotController.py  # Router do chatbot
```

## Instalação

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # preencher GEMINI_API_KEY
```

## Executar

```bash
uvicorn main:app --reload --port 5500
# ou
python main.py
```

- Documentação interactiva (Swagger): http://localhost:5500/docs

## Endpoints

| Método | Rota            | Descrição                              |
|--------|-----------------|----------------------------------------|
| GET    | `/`             | Estado da API e nº de artigos          |
| POST   | `/api/chatbot`  | Pergunta ao chatbot (conversa contínua)|

### Exemplo

```bash
curl -X POST http://localhost:5500/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
        "query": "O que diz o Artigo 1?",
        "history": [
          {"role": "user", "content": "Olá"},
          {"role": "assistant", "content": "Olá! Como posso ajudar?"}
        ]
      }'
```

Resposta:

```json
{ "response": "..." }
```
