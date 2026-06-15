export const fetchChatbotResponse = async (query) => {
  const API_URL = 'http://10.53.21.102:5000/api/chatbot';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na resposta do servidor');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao chamar API do chatbot:', error);
    throw error;
  }
};