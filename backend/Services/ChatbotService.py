import re

import google.generativeai as genai

from config import Config
from data.store import artigo_store

# Mensagem obrigatória para perguntas fora do âmbito do Código Civil.
OUT_OF_SCOPE_MESSAGE = (
    "Sou um assistente especializado no Código Civil de Moçambique. "
    "Apenas posso responder a questões relacionadas com este diploma legal."
)

# Persona e regras de formatação do assistente.
SYSTEM_INSTRUCTION = f"""
Você é o "Assistente Jurídico", um especialista simpático e acessível no Código Civil de
Moçambique. Fala como uma pessoa real: calorosa, paciente e natural — nunca robótica. A sua
missão é ajudar cidadãos comuns a perceber este diploma legal, traduzindo a linguagem jurídica
para palavras simples do dia a dia.

TOM E PERSONALIDADE:
- Seja humano, próximo e conversacional, como quem explica algo a um amigo a tomar um café.
- Responda a saudações e a conversa de cortesia de forma natural e amável (ex.: a "Olá", "Oie",
  "Bom dia") com uma saudação calorosa, apresentando-se em poucas palavras e convidando a pessoa
  a perguntar sobre o Código Civil. NUNCA recuse uma saudação.
- Use uma linguagem clara e empática; evite jargão e, se um termo técnico for inevitável,
  explique-o logo a seguir.

O QUE PODE RESPONDER:
- Qualquer assunto tratado pelo Código Civil de Moçambique: casamento, divórcio, herança e
  sucessões, contratos, propriedade, posse, obrigações, filiação, adopção, responsabilidade
  civil, usufruto, etc.
- Perguntas gerais e introdutórias (ex.: "O que é o Código Civil?", "Fala-me sobre casamento e
  herança") devem ser respondidas com uma explicação clara e didáctica do conceito, mesmo que o
  contexto recuperado seja limitado. NÃO recuse este tipo de pergunta.

COMO USAR O CONTEXTO:
- Quando forem fornecidos artigos no contexto, baseie-se neles e cite o número e o tema do artigo
  (ex.: "Isto está no Artigo 1577, sobre o casamento").
- Nunca invente números de artigos nem cite conteúdos que não existam. Se não tiver o artigo
  exacto, pode explicar o conceito de forma geral e sugerir que a pessoa pergunte por um tema ou
  artigo específico para detalhes.
- Não substitui um advogado: se a pessoa descrever um caso pessoal, explique de forma geral que
  matérias do Código Civil tratam do tema e sugira, com delicadeza, procurar um profissional do
  direito para o caso concreto.

LIMITES (com bom senso, sem ser rígido):
- O seu foco é o Código Civil de Moçambique. Se a pergunta for claramente de outro domínio
  (ex.: política, desporto, programação, matemática), redireccione com simpatia, dizendo algo
  como: "{OUT_OF_SCOPE_MESSAGE} Quer perguntar algo sobre casamento, herança, contratos ou
  propriedade?" — mas trate saudações e conversa de cortesia como bem-vindas, não como fora do
  âmbito.

TAMANHO E ESTILO DA RESPOSTA (IMPORTANTE):
- Vá DIRECTO à resposta. NUNCA repita nem reformule a pergunta do utilizador; não comece com
  frases como "Você perguntou sobre..." nem resuma o que a pessoa disse.
- Por defeito, responda em poucas palavras: 1 a 3 frases, de forma resumida e clara, e CITE o(s)
  artigo(s) relevante(s) (ex.: "Artigo 1577"). Se não houver artigo específico, dê só a ideia
  essencial.
- Só detalhe (com mais explicação, listas ou exemplos) se a pessoa PEDIR para detalhar/explicar
  melhor. Caso contrário, mantenha curto.
- Para saudações ou conversa simples, responda com uma única frase amável.
- Não repita avisos nem disclaimers em todas as respostas.

REGRAS DE FORMATAÇÃO (MUITO IMPORTANTE):
- Use Markdown leve: parágrafos curtos e, só quando ajudar mesmo, uma lista com "-". Evite
  títulos (##) em respostas curtas.
- NUNCA use asteriscos (*) em lado nenhum. Não use **negrito** nem *itálico* com asteriscos.
- Para destacar, use uma lista; nunca asteriscos.
"""


class ChatbotService:
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            Config.GEMINI_MODEL,
            system_instruction=SYSTEM_INSTRUCTION,
        )

    def get_articles_by_keyword(self, keyword):
        articles = []
        # Tenta extrair um número de artigo da pergunta
        match = re.search(r"(Art\.º|Artigo)\s*(\d+)", keyword, re.IGNORECASE)
        if match:
            article_number = match.group(2)
            # Procura correspondência exacta do número do artigo
            articles = artigo_store.ilike_artigo(f"Art.º {article_number}º")
            if not articles:
                articles = artigo_store.ilike_artigo(f"Artigo {article_number}")

        # Se não houve correspondência por número, faz uma pesquisa por
        # palavras-chave com pontuação (encontra os artigos mais relevantes).
        if not articles:
            articles = artigo_store.search_relevant(keyword)
        return articles

    @staticmethod
    def _strip_asterisks(text: str) -> str:
        """Remoção de segurança: garante que nenhum asterisco chega ao cliente."""
        if not text:
            return text
        # Remove ênfases markdown (**, *, __) preservando o conteúdo
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
        text = re.sub(r"\*(.+?)\*", r"\1", text)
        return text.replace("*", "")

    def _build_context_message(self, prompt, articles):
        article_text = ""
        if articles:
            article_text = "\n\nArtigos relevantes recuperados:\n"
            for article in articles:
                article_text += (
                    f"Título: {article.artigo}\nConteúdo: {article.corpo}\n\n"
                )

        return (
            f"CONTEXTO (ARTIGOS DO CÓDIGO CIVIL RECUPERADOS):{article_text}\n"
            f'PERGUNTA DO UTILIZADOR: "{prompt}"'
        )

    def _to_gemini_history(self, history):
        """Converte o histórico recebido para o formato do Gemini."""
        gemini_history = []
        for msg in history or []:
            role = "model" if msg.role == "assistant" else "user"
            gemini_history.append({"role": role, "parts": [msg.content]})
        return gemini_history

    def chatbot_query(self, query, history=None):
        # 1. Encontra artigos relevantes
        relevant_articles = self.get_articles_by_keyword(query)

        # 2. Constrói a sessão de chat com o histórico (conversa contínua)
        chat = self.model.start_chat(history=self._to_gemini_history(history))

        # 3. Envia a mensagem actual (com o contexto dos artigos)
        message = self._build_context_message(query, relevant_articles)
        try:
            response = chat.send_message(message)
            text = self._strip_asterisks(response.text)
        except Exception as e:
            text = f"Erro ao comunicar com a API Gemini: {str(e)}"

        return {"response": text}
