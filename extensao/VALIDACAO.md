# Validação - 23/10/2026

Extensão Manifest V3, versão 1.0.0, com execução local e pacote de dependências incluído.

## Verificações realizadas

- 11 testes automatizados de leitura, associação de vendedores, filtros, preços, blocos, datas, divergências financeiras e seleção.
- Guia real: 152 cadastros únicos, 17 bairros; reprodução dos 14 empreendimentos de Icaraí para studio, loft ou 1 quarto.
- PDFs reais: 19 tabelas associadas à seleção de Icaraí, incluindo todas as opções relevantes da SELLING e Mb Loft.
- Stage: 17 unidades elegíveis por modalidade, mantendo bloco e preço próprio de cada fluxo; não somar modalidades como novo estoque.
- SELLING: Living 141 e OKA separados do estoque da construtora, com suas condições e datas.
- Matrizes: 141 Living por pavimento/final; lotes da Fazenda Fillomena por quadra/lote.
- Formatos adicionais: Jardim dos Manacás e Calle Sardegna (Santa Rosa), Conviva Charitas e Fazenda Fillomena (Badu).
- Extensão carregada em Chrome for Testing 156.0.8078.4, com perfil isolado. Sem instalação ou alteração do perfil pessoal do usuário.
- Importação de uma pasta por seletor, leitura do guia, aplicação dos filtros, busca, conferência da página original e seleção da unidade OKA/SELLING 803.
- Exportação somente da seleção visível. PDF padrão de teste: 3 páginas, preço R$ 520.000, financiamento R$ 362.700, condições e fonte; nenhuma linha de preço da outra unidade 801.
- Exportação com anexo do PDF original completo verificada separadamente.
- OCR local verificado nas 2 páginas digitalizadas do Maren by RAMABE: 8 linhas candidatas extraídas. Números reconhecidos por OCR continuam exigindo conferência manual.
- Nenhuma requisição externa originada pela aplicação nos testes do fluxo e do OCR. Bibliotecas, worker, fontes auxiliares e idiomas estão no pacote.
- Renderização visual do PDF e da interface conferida; sem cortes ou sobreposições nas páginas de teste.

## Limites da validação

O carregamento e a importação da pasta foram testados em navegador de teste isolado. A escolha/reconexão da pasta no Chrome pessoal depende da ação do usuário no seletor de arquivos; a extensão não assume autorização para um caminho do Windows. A opção alternativa de importação precisa ser repetida após reabrir a extensão.

Os testes não confirmam estoque em tempo real. A extração classifica linhas como listadas na tabela, identifica situações textuais explícitas e sinaliza informações não discriminadas. Cores, mapas de disponibilidade, riscados, layouts inéditos e OCR podem exigir conferência e edição manual. Preços e parcelas não são corrigidos monetariamente nem transformados em aprovação de financiamento.

A extensão tem associação manual de tabelas e inclusão/edição de unidades para esses casos. Os PDFs originais não são alterados. O ZIP distribuível contém apenas o aplicativo, bibliotecas e licenças; não inclui os PDFs comerciais nem os dados usados nos testes.

## Atualização 1.0.1

Teste direcionado aprovado: aplicar e remover o atalho de Icaraí pelo mesmo botão, limpar pelos filtros e alterar bairro sincronizam os resultados, o texto e aria-pressed. Sem erros de página. Executado com node tests/quick-filter.mjs.
