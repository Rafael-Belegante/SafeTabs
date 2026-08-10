# SafeTabs

**Versão 1.0**

SafeTabs é uma extensão local para Chrome e Microsoft Edge feita para guardar conjuntos de abas e reabri-los quando necessário.

Ela salva somente abas HTTP/HTTPS da janela atual e ignora automaticamente Google Drive, ChatGPT, Grok e Gemini. As sessões ficam no armazenamento local do navegador e podem ser exportadas para JSON para uso em outro computador.

## Recursos

- Salvar todas as abas da janela atual em uma sessão.
- Nomear sessões antes de salvar.
- Renomear sessões já salvas para manter a organização.
- Ignorar automaticamente:
  - Google Drive (`drive.google.com`)
  - ChatGPT (`chatgpt.com` e `chat.openai.com`)
  - Grok (`grok.com` e a rota do Grok no X)
  - Gemini (`gemini.google.com`)
- Expandir uma sessão e visualizar cada aba salva.
- Abrir uma aba individualmente.
- Abrir todas as abas de uma sessão em uma nova janela.
- Remover uma aba específica de uma sessão, com confirmação.
- Remover uma ou várias sessões, com confirmação.
- Buscar por nome da sessão, título da aba, domínio ou URL.
- Selecionar várias sessões para exportar.
- Exportar sessões selecionadas em JSON.
- Importar arquivos do SafeTabs e arquivos antigos do AbaCofre.
- Pré-visualizar e selecionar quais sessões serão importadas.
- Ignorar sessões duplicadas durante a importação.
- Tema claro e escuro com alto contraste.
- Painel Sobre com autoria, resumo do projeto e atalhos para atualizações e outros projetos.
- Interface nas cores roxo e laranja.
- Janela da extensão limitada a 650 px de largura.
- Tipografia nativa otimizada para leitura, priorizando Segoe UI Variable e Segoe UI no Windows.
- Armazenamento local com `chrome.storage.local`.
- Sem servidor, Node.js, npm ou bibliotecas externas.

## Instalação no Chrome

1. Baixe ou clone este repositório.
2. Abra `chrome://extensions/`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta do SafeTabs.
6. Fixe a extensão na barra do navegador, se desejar.

## Instalação no Microsoft Edge

1. Baixe ou clone este repositório.
2. Abra `edge://extensions/`.
3. Ative **Modo de desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta do SafeTabs.

## Transferência entre computadores

No computador de origem, selecione as sessões desejadas e clique em **Exportar selecionadas**. Copie o arquivo JSON gerado para o computador de destino.

No outro computador, abra o SafeTabs, clique em **Importar**, escolha o arquivo e selecione as sessões que deseja adicionar.

## Atualização a partir do AbaCofre

Se os arquivos do SafeTabs substituírem os arquivos da instalação descompactada anterior, mantendo a mesma instalação da extensão, as chaves locais do AbaCofre são reconhecidas e migradas para o formato atual.

Se o SafeTabs for carregado como uma extensão nova em outra pasta, use o fluxo normal de transferência: exporte as sessões no AbaCofre e importe o JSON no SafeTabs. Arquivos exportados pela versão anterior continuam compatíveis.

## Estrutura

```text
SafeTabs/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── .gitignore
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
└── README.md
```

## Links

- Projeto: o botão **Verificar atualizações** abre uma busca direcionada pelo SafeTabs no GitHub.
- Outros projetos: o botão **Mais projetos** abre uma busca pelo autor no GitHub.
- Os destinos usados pelo painel **Sobre** ficam nas constantes `PROJECT_URL` e `PROFILE_URL` em `popup.js`, facilitando a troca pelos links definitivos do repositório e do perfil.

## Privacidade

As sessões ficam no perfil local do navegador. O SafeTabs não possui servidor próprio, não envia a lista de URLs para serviços externos e não carrega código remoto.

## Compatibilidade

- Google Chrome com suporte a Manifest V3.
- Microsoft Edge com suporte a Manifest V3.
