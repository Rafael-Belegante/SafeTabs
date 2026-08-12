# SafeTabs

Extensão para Chrome e Edge que salva conjuntos de abas abertas e permite reabri-las quando quiser. As sessões ficam no armazenamento local do navegador. Sem servidor, sem dependências externas.

## Recursos

- Salvar todas as abas HTTP/HTTPS da janela atual em uma sessão nomeada
- Renomear, expandir e gerenciar sessões salvas
- Abrir abas individualmente ou uma sessão inteira em nova janela
- Remover abas ou sessões com confirmação
- Buscar por nome de sessão, título, domínio ou URL
- Exportar sessões selecionadas para JSON e importar em outro computador
- Ignorar duplicatas na importação com pré-visualização de seleção
- Tema claro e escuro com alto contraste

## Instalação

**Chrome**
1. Baixe ou clone este repositório
2. Acesse `chrome://extensions/`
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação** e selecione a pasta do SafeTabs

**Edge**
1. Baixe ou clone este repositório
2. Acesse `edge://extensions/`
3. Ative o **Modo de desenvolvedor**
4. Clique em **Carregar sem compactação** e selecione a pasta do SafeTabs

## Transferência entre computadores

Selecione as sessões desejadas, clique em **Exportar selecionadas** e copie o JSON gerado. No outro computador, use **Importar** para carregar o arquivo e escolher quais sessões adicionar.

## Estrutura

```
SafeTabs/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
└── README.md
```

## Privacidade

As sessões ficam apenas no perfil local do navegador. O SafeTabs não tem servidor próprio, não envia URLs para serviços externos e não carrega código remoto.

## Compatibilidade

Chrome e Edge com suporte a Manifest V3.

## Licença

MIT. Veja [LICENSE](LICENSE).
