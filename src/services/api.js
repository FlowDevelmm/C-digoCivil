const API_BASE_URL = 'http://127.0.0.1:8000/chat'; // Adjust if your backend is on a different port or domain

export const perguntarChatbot = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Erro ao enviar mensagem para o chatbot.');
        }

        const data = await response.json();
        return data.answer;
    } catch (error) {
        console.error('Erro na comunicação com o chatbot:', error);
        throw error;
    }
};
