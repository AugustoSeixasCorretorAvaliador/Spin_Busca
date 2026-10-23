# Spin Busca

Extensão local para Google Chrome: leitura do guia de bairros, filtros de empreendimentos, busca nas tabelas de vendas das construtoras e da SELLING, seleção de unidades e exportação em PDF.

**Instalação e downloads:** https://augustoseixascorretoravaliador.github.io/Spin_Busca/

## Para instalar

1. Abra a página de instalação e informe a senha diária fornecida pelo responsável.
2. Baixe e extraia a extensão e o pacote de tabelas, disponíveis na release v1.0.1.
3. No Chrome, abra `chrome://extensions`, ative o Modo do desenvolvedor e clique em **Carregar sem compactação**.
4. Escolha a pasta extraída que contém `manifest.json`.
5. Clique no ícone da extensão e selecione a pasta que contém `Guia de Bairro.pdf` na raiz, junto às subpastas das tabelas.

## Conteúdo do repositório

- `index.html`: página de instalação e downloads, com trava simples de senha diária.
- `extensao/`: código-fonte e documentação da extensão, versão 1.0.1.
- Os ZIPs instaláveis e o pacote de tabelas ficam nos assets da release, fora do histórico Git.

O pacote de tabelas foi fornecido pelo responsável pela publicação e distribuído sem alterações. Pode conter arquivos auxiliares além dos PDFs; para consultar, escolha a pasta com o guia na raiz.

## Desenvolvimento

Requer Node.js 22.13 ou superior.

```sh
cd extensao
npm ci
npm run build
```

A pasta `extensao/dist` resultante pode ser carregada no Chrome. O ZIP distribuído já inclui bibliotecas, OCR local e licenças.

## Dados e acesso

A extensão processa os PDFs localmente e não fornece confirmação de estoque em tempo real. Confira a data, os valores e as condições nas tabelas originais antes de enviar uma proposta.

A senha do HTML segue a data local no formato MMDDYY (23/10/2026 → 102326). É uma trava visual simples, sem autenticação de servidor. O repositório e os downloads são públicos; a senha não impede acesso por links diretos.
