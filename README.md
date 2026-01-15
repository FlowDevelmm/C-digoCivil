# Code25K - Assistente do Código Civil Moçambicano 🇲🇿

Bem-vindo ao **Código Civil Mz**, seu assistente jurídico interativo e moderno para o Código Civil de Moçambique. Este aplicativo foi desenvolvido para facilitar o acesso à informação jurídica, oferecendo recursos avançados como um Chatbot com IA, visualização de artigos, factos curiosos e muito mais.

## 📱 Funcionalidades Principais

### 1. 🏠 Início Interativo
- **Artigo do Dia:** Aprenda algo novo todos os dias com um artigo do Código Civil em destaque.
- **Factos sobre a Lei:** Curiosidades jurídicas relevantes para o contexto moçambicano (ex: Maioridade, Casamento).
- **Pesquisa Rápida:** Encontre livros e tópicos do Código Civil rapidamente.

### 2. 🤖 Chatbot "Assistente Civil"
Um assistente virtual inteligente pronto para responder suas dúvidas sobre legislação.
- **Gatekeeper de Segurança:** Sistema de acesso exclusivo via código de 8 dígitos.
- **Instruções Integradas:** Guia passo a passo narrativo e gentil na tela de bloqueio explicando como obter o acesso (Transferência de 500 MT -> Confirmação via WhatsApp).
- **Persistência Inteligente:** O acesso liberado dura por **30 dias**, renovando-se automaticamente sem necessidade de redigitar o código durante esse período.
- **Interface Conversacional:** Design moderno tipo chat (WhatsApp/Telegram) com suporte a histórico de mensagens.

### 3. 📖 Navegação no Código
- Estrutura organizada por Livros, Títulos e Capítulos.
- Leitura agradável com tipografia ajustada e responsiva.

### 4. ⭐ Favoritos e Personalização
- Marque artigos importantes para acesso rápido.
- Suporte a Temas (Claro/Escuro).

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as tecnologias mais modernas do ecossistema React Native:

- **Framework:** [React Native](https://reactnative.dev/) (v0.81) via [Expo](https://expo.dev/) (SDK 54).
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) para maior segurança e escalabilidade.
- **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) (v6).
- **UI/UX:**
  - `react-native-paper` para componentes Material Design.
  - `react-native-reanimated` para animações fluidas.
  - Estilização responsiva com utilitário `normalize` personalizado.
- **Armazenamento Local:** `@react-native-async-storage/async-storage` para persistir o histórico do chat e o código de acesso.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar o aplicativo em seu ambiente de desenvolvimento:

### Pré-requisitos
- Node.js instalado.
- Gerenciador de pacotes `npm` ou `yarn`.
- Dispositivo físico ou emulador (Android/iOS) configurado.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd Code25K
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npx expo start
    ```

4.  **Abra no dispositivo:**
    -   Escaneie o QR Code com o aplicativo **Expo Go** (Android/iOS).
    -   Ou pressione `a` para abrir no emulador Android, `i` para o simulador iOS.

## 📂 Estrutura do Projeto

```
/
├── app.json             # Configuração do Expo
├── package.json         # Dependências e scripts
├── src/
│   ├── app/             # Rotas e Telas (Expo Router)
│   │   ├── (tabs)/      # Navegação por Abas (Home, Chatbot, Pesquisa, etc.)
│   │   │   ├── chatbot.tsx # Tela do Assistente com Gatekeeper
│   │   │   ├── index.tsx   # Tela Inicial (Dashboard)
│   │   │   └── ...
│   │   └── ...
│   ├── components/      # Componentes reutilizáveis
│   ├── service/         # Integração com APIs externas
│   ├── utils/           # Utilitários (ex: normalize.ts)
│   ├── hooks/           # Hooks personalizados
│   └── ...
└── assets/              # Imagens, fontes e ícones
```

## 🔒 Detalhes do Acesso (Chatbot)

O acesso ao Chatbot é restrito e gerenciado por um sistema de tokens:
1.  O usuário vê uma tela de bloqueio com instruções.
2.  Após realizar o pagamento (500 MT) e confirmar via WhatsApp (`828376317`), recebe um código.
3.  Ao inserir o código válido, o acesso é liberado e o token é salvo localmente.
4.  O sistema verifica a validade do token a cada abertura (expira em 30 dias).

---
Desenvolvido com ❤️ para a comunidade jurídica de Moçambique.
