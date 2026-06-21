# Código Civil Mz — Assistente do Código Civil Moçambicano 🇲🇿

Aplicação para consultar e compreender o **Código Civil de Moçambique** de forma
simples, com um **assistente jurídico (chatbot)** alimentado por IA. O projecto
tem duas partes:

- **`backend/`** — API em **FastAPI** que serve o chatbot (respostas geradas pelo
  Google Gemini com base nos artigos do Código Civil).
- **`frontend/`** — aplicação móvel em **React Native / Expo** (o cliente que o
  utilizador usa).

> A pasta `api.codigo-civil/` contém a API original em Flask, que serviu de base e
> foi reimplementada em FastAPI dentro de `backend/`.

## 📱 Funcionalidades

### 🤖 Assistente Jurídico (Chatbot)
- **Linguagem simples e humana:** traduz a linguagem jurídica para o dia a dia.
- **Conversa contínua:** mantém o contexto das mensagens anteriores.
- **Respostas em Markdown** (sem asteriscos), curtas e directas por defeito —
  detalha apenas quando o utilizador pede.
- **Citações de artigos clicáveis:** ao tocar num "Artigo 1577" mencionado na
  resposta, abre um modal com a **hierarquia** (Livro › Título › Capítulo ›
  Secção › Subsecção) e o **texto completo** do artigo.

### 📖 Navegação no Código
- Estrutura organizada por Livros, Títulos, Capítulos, Secções e Subsecções.
- Pesquisa de artigos e tópicos.

### ⭐ Personalização
- Favoritos, anotações e tema Claro/Escuro.

## 🛠️ Tecnologias

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) via `google-generativeai`
- Os artigos são carregados para **memória** a partir de um dump SQL
  (`backend/data/chatbot.sql`) — **sem base de dados**.

**Frontend**
- [React Native](https://reactnative.dev/) (0.81) via [Expo](https://expo.dev/) (SDK 54)
- [TypeScript](https://www.typescriptlang.org/) e [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
- `react-native-paper`, `react-native-reanimated`, utilitário `normalize` responsivo
- `@react-native-async-storage/async-storage` para persistência local

## 🚀 Como executar

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # preencher GEMINI_API_KEY
```

Arrancar o servidor (acessível na rede local, para o telemóvel poder ligar):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5500
```

- API: `http://localhost:5500/` · Documentação (Swagger): `http://localhost:5500/docs`
- Endpoint principal: `POST /api/chatbot` com `{ "query": "...", "history": [...] }`

> Se o telemóvel não ligar, liberte a porta na firewall:
> `sudo firewall-cmd --add-port=5500/tcp`

### 2. Frontend (Expo)

```bash
cd frontend
npm install
npx expo start
```

Aponte o **endereço do backend** em [`frontend/src/config.ts`](frontend/src/config.ts)
(use o IP da máquina onde o backend corre, na mesma rede Wi-Fi do telemóvel).
Pode também sobrepor sem alterar o código:

```bash
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP:5500 npx expo start
```

Depois, leia o QR Code com o **Expo Go** (Android/iOS) ou use um emulador.

## 📂 Estrutura do projecto

```
/
├── backend/                 # API FastAPI do chatbot
│   ├── main.py              # App FastAPI
│   ├── config.py            # Configurações (Gemini, caminho do dump)
│   ├── schemas.py           # Modelos Pydantic (pedido/resposta)
│   ├── data/                # Dump SQL + parser + repositório em memória
│   ├── Models/              # Artigo (dataclass)
│   ├── Services/            # ChatbotService (pesquisa + Gemini)
│   └── Controllers/         # Router do chatbot
│
├── frontend/                # App React Native / Expo
│   ├── app.json
│   └── src/
│       ├── app/(tabs)/      # Rotas por abas (Início, Código, Pesquisa, Mais)
│       ├── components/
│       │   └── ChatbotWidget.tsx   # Assistente (chat + artigos clicáveis)
│       ├── services/api.js  # Chamada ao backend (/api/chatbot)
│       ├── config.ts        # URL base do backend
│       ├── utils/
│       │   └── artigoLookup.ts     # Localiza artigos + hierarquia
│       └── data.ts          # Código Civil (conteúdo completo)
│
└── api.codigo-civil/        # API original em Flask (referência)
```

## 🔌 API do chatbot

`POST /api/chatbot`

```json
{
  "query": "O que diz o Artigo 1577?",
  "history": [
    { "role": "user", "content": "Olá" },
    { "role": "assistant", "content": "Olá! Como posso ajudar?" }
  ]
}
```

Resposta:

```json
{ "response": "..." }
```

---
Desenvolvido com ❤️ para a comunidade jurídica de Moçambique.
