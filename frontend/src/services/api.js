import { API_BASE_URL } from '../config';

/**
 * Envia uma pergunta ao chatbot jurídico do Código Civil.
 *
 * @param {string} query   Pergunta do utilizador em linguagem natural.
 * @param {Array<{role: 'user'|'assistant', content: string}>} history
 *        Histórico da conversa, para manter o contexto contínuo.
 * @returns {Promise<{response: string}>}
 */
export const fetchChatbotResponse = async (query, history = []) => {
  const API_URL = `${API_BASE_URL}/api/chatbot`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, history }),
    });

    if (!response.ok) {
      let message = 'Erro na resposta do servidor';
      try {
        const errorData = await response.json();
        message = errorData.detail || errorData.message || message;
      } catch {
        // resposta sem corpo JSON — mantém a mensagem genérica
      }
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao chamar API do chatbot:', error);
    throw error;
  }
};