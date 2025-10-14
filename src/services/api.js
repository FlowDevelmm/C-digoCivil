const API_URL = "http://127.0.0.1:8000";

export async function syncArtigos(ultimaAtualizacao) {
    const response = await fetch(`${API_URL}/artigos/sync?ultima_atualizacao=${ultimaAtualizacao}`);
    return await response.json();
}

export async function perguntarChatbot(pergunta) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
        const response = await fetch(`${API_URL}/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pergunta }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('A requisição demorou muito e foi cancelada. O servidor está disponível?');
        }
        throw error;
    }
}