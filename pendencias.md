# Pendências do IndieFlix

Baseado no `escopo.md`. Lista só o que ainda não está completo.

## 1. Requisitos obrigatórios

O RF04 está cumprido: o admin vê todas as publicações, banir exige justificativa, filme banido sai da listagem e da busca, e o filmmaker vê o motivo e pode corrigir para reenviar. Desbanir não pede justificativa.

### Não funcionais (RNF02)

- [ ] **Otimizar as capas.** Hoje a capa é o arquivo original, usado como imagem de fundo nos cards. Falta gerar uma versão redimensionada e comprimida.

## 2. Bônus (seção 6)

Streaming por Range Request e comentários na página do filme (com o filmmaker vendo o feedback) já estão feitos. Abaixo, o que o texto ainda pede, do mais fácil ao mais difícil.

- [x] **Tema claro / escuro.** Alternância de modo light e dark.
- [x] **Login social.** SSO pelo Better Auth (Google, GitHub etc.).
- [ ] **Banner de destaque.** O carrossel e o hover que mostra a sinopse já existem. Falta o banner de destaque citado junto deles.
- [x] **Progresso e histórico.** O player salva o tempo em que o usuário parou, oferece "Continuar assistindo" e guarda um histórico dos últimos filmes assistidos.
- [ ] **Ficha técnica.** O admin cadastra pessoas (atores, diretores, dubladores etc.) com tags/funções. Filmmaker e admin vinculam esse elenco ao filme.
- [ ] **Player customizado.** Player dedicado ou customizado, com controle de qualidade, atalhos de teclado, barra de progresso personalizada e ajuste de velocidade.
- [ ] **Séries / sequências.** Organizar conteúdos em sequências/continuações de filmes, ou em séries com temporadas e episódios. O texto pede um dos dois.
- [ ] **Recomendação.** Na home/catálogo, com base nas categorias mais assistidas ou avaliadas pelo usuário, nos filmmakers/criadores mais assistidos e nas pessoas envolvidas (diretores/atores associados ao histórico).
