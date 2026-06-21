/**
 * Configuração central da aplicação.
 *
 * `API_BASE_URL` aponta para o backend (FastAPI) do chatbot. Em
 * desenvolvimento, num dispositivo físico, use o IP da máquina onde o backend
 * corre (não `localhost`). O backend arranca por omissão na porta 5500.
 *
 * Pode sobrepor o valor com a variável de ambiente do Expo
 * `EXPO_PUBLIC_API_BASE_URL` sem alterar o código.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.237.7.237:5500';
