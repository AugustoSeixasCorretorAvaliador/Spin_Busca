# Tabelas de Vendas - extensão para Chrome

## Instalar

1. No Chrome, abra chrome://extensions.
2. Ative o **Modo do desenvolvedor**, no canto superior direito.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta **dist** deste projeto. Se recebeu o ZIP, extraia-o primeiro e selecione a pasta que contém manifest.json.
5. Clique no ícone da extensão. Ela abre uma aba própria; pode fixar o ícone pelo menu de extensões.
6. Clique em **Escolher pasta de PDFs** e selecione `E:\Main HEROIA 2026 UNIF\Tabelas de Vendas`.

Chrome 133 ou superior. Não é necessário permitir acesso a todos os sites ou a URLs de arquivo. O Chrome exige que o usuário escolha a pasta; uma extensão não pode assumir acesso a um caminho do Windows. A extensão pede somente leitura e não altera os PDFs. A permissão unlimitedStorage guarda o cache dos documentos localmente. Não há servidor, chave de API, assinatura ou serviço externo.

Se o seletor principal não estiver disponível, use **Importar pasta (alternativa)**. Essa opção também lê as subpastas, mas precisa ser repetida ao reabrir a extensão ou atualizar os PDFs.

## Usar

1. A extensão encontra **Guia de Bairro.pdf** e lê os empreendimentos por colunas e páginas.
2. Filtre por busca textual, região, bairro, construtora, tipologia, entrega ou intervalo de anos. Ctrl + clique combina valores de uma mesma lista. Filtros diferentes se combinam com E.
3. Marque os empreendimentos. **Selecionar resultados** marca todos os visíveis. O atalho Icaraí seleciona os filtros de bairro e studio/loft/1 quarto; depois marque os resultados desejados.
4. Pode ir direto a **Gerar PDF** para exportar a lista de empreendimentos sem preços.
5. Para cotar unidades, clique em **Buscar unidades dos selecionados**. A busca percorre as subpastas, incluindo SELLING, JM e demais vendedores. Não usa só a pasta da construtora. Cada vendedor e modalidade mantém seu preço e fluxo.
6. Na segunda etapa, filtre por tipologia, vendedor, faixa de preço, área, vaga, data da tabela, validade, conferência manual e tipologia explícita. O filtro **Outro campo da tabela** pesquisa qualquer coluna extraída: por exemplo, “sinal”, “mensais”, “financiamento”. Escolha texto, mínimo ou máximo. Valores numéricos usam números sem separador de milhar, como 500000.
7. Confira cada opção em **Página e condições**. A página original é renderizada na extensão. Pode abrir o PDF completo, marcar conferência ou editar dados. Se uma unidade não foi extraída, use **Adicionar unidade conferida** e informe fonte, página e todos os campos/condições pertinentes.
8. Marque somente as unidades que deseja oferecer. Vários anúncios da mesma unidade representam modalidades/vendedores, não novo estoque. Confira bloco/torre.
9. Em **Gerar PDF**, preencha título, cliente e mensagem. Exporte empreendimentos ou unidades. **Somente itens marcados que continuam visíveis nos filtros** entram no PDF. Seleções ocultas são contadas, mas não exportadas.
10. O PDF de unidades contém resumo, detalhes completos das colunas da linha, condições e cabeçalhos transcritos, datas, avisos e referência de fonte/página. Os números não são recalculados nem corrigidos monetariamente.
11. Opcionalmente, marque **Anexar PDFs originais completos**. Isso acrescenta as tabelas na diagramação original, inclusive as outras unidades nelas existentes. Por padrão, esse anexo é desativado e as linhas das outras unidades são omitidas da transcrição de condições.

## PDFs novos, nomes e formatos diferentes

- Use **Atualizar arquivos** depois de adicionar/substituir PDFs. O cache considera caminho, tamanho e data de modificação; arquivos alterados são lidos novamente.
- Na aba de empreendimentos, **Associar uma tabela** permite vincular manualmente qualquer PDF a um empreendimento quando o nome não permite correspondência automática.
- **Conferir ou corrigir cadastro do guia** corrige somente o cache local da extensão. Os PDFs originais permanecem intactos.
- A extensão não usa a lista de Icaraí preparada anteriormente como banco fixo: lê os PDFs escolhidos em cada atualização.
- Para PDFs digitalizados, marque **Usar OCR** antes de atualizar/buscar. O reconhecimento utiliza arquivos de português e inglês já incluídos no pacote e funciona sem enviar os PDFs à internet. OCR pode errar números: confira a página original antes da oferta. Não é um reconhecimento infalível.
- **Esquecer pasta e cache** remove as referências e os dados do navegador, não os PDFs.

## O que significa disponibilidade

“Listada na tabela” indica uma linha encontrada no documento. Não é consulta em tempo real ao estoque da construtora/broker. Vendido/reservado/bloqueado por texto explícito é sinalizado e oculto por padrão. Situações indicadas apenas por cor, riscados, imagens ou convenções não declaradas exigem conferência visual.

Tipologia vinda do guia é identificada como **Guia; confirmar planta**, nunca como comprovação individual. Coberturas, lojas e outras seções explícitas são classificadas separadamente. Previsão de entrega não é transformada em obra entregue. Data do nome do arquivo e data interna ficam separadas. Tabelas vencidas/antigas e somas divergentes são sinalizadas; o algoritmo não inventa parcelas ausentes.

Tabelas com layouts inéditos podem exigir associação ou inclusão/correção manual. Todos os textos extraídos e a página original ficam disponíveis para conferência. O PDF é uma seleção documental, não uma proposta aprovada pelo vendedor.

## Desenvolvimento e testes

O diretório **dist** é o pacote instalável; **src**, **scripts** e **tests** são o código e a validação. Dependências com versões fixas em package-lock.json e licenças no pacote.

- `npm ci` (Node 22.13+ recomendado pela versão do PDF.js).
- `npm run build`.
- `npm test`.
- `npm run test:pdfs` (usa os PDFs na pasta pai).
- `npm run test:ui` (testes de navegador; usa um perfil isolado).

Documentação técnica: [Manifest V3 / CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy), [File System Access](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker), [PDF.js](https://mozilla.github.io/pdf.js/examples/).

Para o teste de carregamento real da extensão, instale o navegador de teste isolado com PowerShell, na pasta do projeto:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/tests/browsers"
node node_modules/playwright/cli.js install chromium --no-shell
npm.cmd run test:extension
```

O navegador de teste não é incluído no ZIP instalável nem altera o perfil do Chrome pessoal.

## Atualização 1.0.1

O atalho de Icaraí agora alterna entre aplicar e remover o filtro. Quando ativo, o próprio botão mostra **Limpar filtro de Icaraí ×**. Clique nele novamente para voltar aos demais empreendimentos. O botão **Limpar filtros** também remove esse estado. As marcações de empreendimentos são independentes; para desmarcá-los, use **Limpar seleção**.
