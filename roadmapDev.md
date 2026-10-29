Fase 0 — Base técnica e banco de dados
Objetivo: garantir que a aplicação e o banco estejam funcionando corretamente antes de desenvolver as funcionalidades.
- [ ] INF-01 Subir a aplicação localmente e confirmar os comandos de execução.
- [ ] INF-02 Subir o PostgreSQL pelo Docker Compose e validar a conexão.
- [ ] INF-03 Executar as migrations do Drizzle em um banco limpo.
- [ ] INF-04 Conferir as tabelas do Better Auth e do catálogo.
- [ ] INF-05 Conferir se a tabela movies possui a coluna de classificação indicativa. Criar migration se estiver ausente.
- [ ] INF-06 Criar ou conferir o arquivo .env.example, sem segredos.
- [ ] INF-07 Confirmar que lint e build funcionam.
- [ ] INF-08 Decidir onde armazenar vídeos e thumbnails. Guardar no PostgreSQL somente metadados e URLs/chaves, não os arquivos de mídia.
Concluído quando: a aplicação, o banco e as migrations funcionarem a partir de um ambiente limpo.
Fase 1 — Cadastro, login e permissões
Objetivo: garantir que cada perfil tenha acesso apenas às funcionalidades permitidas.
- [ ] AUTH-01 Validar o cadastro com Better Auth.
- [ ] AUTH-02 Garantir que novas contas recebam o perfil user no servidor.
- [ ] AUTH-03 Validar o login e o redirecionamento para /home.
- [ ] AUTH-04 Validar logout e expiração da sessão.
- [ ] AUTH-05 Proteger todas as páginas autenticadas.
- [ ] AUTH-06 Criar ou verificar funções auxiliares de sessão e autorização no servidor.
- [ ] AUTH-07 Mostrar o botão Admin somente para o perfil admin.
- [ ] AUTH-08 Mostrar o botão Filmmaker para os perfis filmmaker e admin.
- [ ] AUTH-09 Bloquear acessos diretos por URL e chamadas de ações/API sem permissão.
- [ ] AUTH-10 Impedir que um usuário comum promova a própria conta por meio de uma requisição manipulada.
Regras dos perfis
- User: acessar o catálogo, assistir aos filmes e criar ou editar suas próprias avaliações.
- Filmmaker: tudo que o usuário pode fazer, além de cadastrar e editar seus próprios filmes.
- Admin: gerenciar usuários, perfis e categorias, além de moderar filmes.
Regras adicionais:
- Um filmmaker não pode editar filmes de terceiros.
- O admin pode moderar os filmes, mas não deve editar ou excluir diretamente o conteúdo criado por filmmakers.
- O catálogo comum deve mostrar somente filmes ativos.
- A autorização deve ser verificada no servidor. Esconder um botão não é suficiente.
Concluído quando: os três perfis e suas permissões tiverem sido testados.
Fase 2 — Navbar e navegação
Objetivo: conectar a navegação visual às funcionalidades reais.
- [ ] NAV-01 Exibir a navbar nas telas autenticadas, exceto no player.
- [ ] NAV-02 Fazer o ícone e o nome IndieFlix direcionarem para /home.
- [ ] NAV-03 Centralizar a pesquisa e posicionar os botões Admin e Filmmaker antes do perfil.
- [ ] NAV-04 Preservar nome, foto de perfil e botão de sair que já existem.
- [ ] NAV-05 Tornar a navbar responsiva.
- [ ] NAV-06 Implementar pesquisa global por título, consultando os dados reais enquanto o usuário digita.
- [ ] NAV-07 Abrir o filme selecionado nos resultados.
- [ ] NAV-08 Garantir que a pesquisa de usuários comuns nunca retorne filmes banidos.
Concluído quando: a navbar estiver integrada às rotas e aos dados reais.
Fase 3 — Cards e catálogo
Objetivo: conectar o MovieCard ao banco de dados.
- [ ] CAT-01 Criar a consulta de filmes ativos.
- [ ] CAT-02 Conectar o MovieCard aos dados reais e remover dados simulados.
- [ ] CAT-03 Mostrar thumbnail, título, autor, gêneros, nota média e quantidade de avaliações.
- [ ] CAT-04 Fazer o botão “Ver sinopse” mostrar ou expandir a sinopse.
- [ ] CAT-05 Fazer o botão “Ver filme” navegar para o player.
- [ ] CAT-06 Mostrar os gêneros na parte superior do card.
- [ ] CAT-07 Mostrar o selo “Banido” nas telas de filmmaker e admin.
- [ ] CAT-08 Permitir consultar a justificativa do banimento por clique ou popover acessível, sem depender somente do hover.
- [ ] CAT-09 Implementar estados de carregamento, erro e lista vazia.
- [ ] CAT-10 Garantir que usuários comuns não recebam filmes banidos nas consultas.
- [ ] CAT-11 Ajustar responsividade e carregamento das thumbnails.
Concluído quando: os cards exibirem dados reais e cada ação funcionar corretamente.
Fase 4 — Home e categorias
Objetivo: montar o catálogo principal e a navegação por categorias.
Home
- [ ] HOME-01 Implementar /home com navbar e catálogo.
- [ ] HOME-02 Buscar somente categorias que possuam pelo menos um filme ativo.
- [ ] HOME-03 Exibir um carrossel de filmes para cada categoria.
- [ ] HOME-04 Ordenar filmes por média de avaliação decrescente.
- [ ] HOME-05 Em caso de empate, ordenar pelo título em ordem alfabética.
- [ ] HOME-06 Definir onde ficam os filmes sem avaliações.
- [ ] HOME-07 Implementar filtros ou atalhos para as categorias.
Página de categoria
- [ ] CATG-01 Implementar /home/category/[slug], ou uma rota equivalente consistente.
- [ ] CATG-02 Mostrar o nome da categoria e seus filmes ativos.
- [ ] CATG-03 Ordenar os filmes alfabeticamente pelo título.
- [ ] CATG-04 Filtrar a lista pelo título enquanto o usuário digita.
- [ ] CATG-05 Tratar categorias inexistentes ou sem filmes.
Concluído quando: a home e as páginas de categorias utilizarem consultas reais e respeitarem as regras de ordenação.
Fase 5 — Detalhe do filme e player
Objetivo: permitir que o usuário assista aos filmes e acesse as avaliações.
- [ ] PLAY-01 Mostrar título, sinopse, classificação indicativa, categorias e autor.
- [ ] PLAY-02 Implementar o player HTML5.
- [ ] PLAY-03 Impedir que usuários comuns reproduzam filmes banidos, inclusive acessando a URL diretamente.
- [ ] PLAY-04 Ocultar a navbar na tela do player.
- [ ] PLAY-05 Adicionar um botão de avaliação próximo ao player.
- [ ] PLAY-06 Mostrar uma estrela preenchida se o usuário já avaliou e uma estrela sem preenchimento caso contrário.
- [ ] PLAY-07 Tratar falhas ao carregar o vídeo.
- [ ] PLAY-08 Validar a estratégia de armazenamento, entrega e permissão dos vídeos.
Decisão de interface: manter o botão de avaliação visível próximo ao player. Isso é mais simples e previsível do que abrir o formulário automaticamente quando o vídeo for pausado.
Fase 6 — Avaliações
Objetivo: permitir que cada usuário avalie um filme uma única vez, podendo editar sua avaliação depois.
- [ ] RATE-01 Garantir uma restrição única no banco para (userId, movieId).
- [ ] RATE-02 Criar avaliações com nota e comentário opcional.
- [ ] RATE-03 Buscar a avaliação do usuário atual para o filme.
- [ ] RATE-04 Abrir o modal vazio quando o usuário ainda não avaliou.
- [ ] RATE-05 Abrir o modal preenchido quando já existe uma avaliação.
- [ ] RATE-06 Atualizar a avaliação existente, sem inserir uma duplicada.
- [ ] RATE-07 Validar a nota no servidor: de 0,5 a 5,0, em incrementos de 0,5.
- [ ] RATE-08 Implementar a seleção de estrelas com incrementos de 0,5, incluindo teclado e alternativa acessível.
- [ ] RATE-09 Atualizar a média e a quantidade de avaliações depois de criar ou editar.
- [ ] RATE-10 Criar o modal com a lista de avaliações, incluindo nome do avaliador, nota e comentário, quando houver.
- [ ] RATE-11 Mostrar o título do filme no cabeçalho do modal.
- [ ] RATE-12 Fazer o clique na nota ou contagem do card abrir a lista de avaliações.
- [ ] RATE-13 Evitar duplicidade mesmo quando ocorrerem requisições simultâneas.
- [ ] RATE-14 Definir o arredondamento e a formatação da média.
Importante para o banco: se a coluna atual de nota for smallint, ela não representa diretamente valores como 3.5 ou 4.5. Revise o tipo da coluna, a constraint e as validações antes de implementar a interface.
Comportamento esperado
- Cada usuário pode avaliar vários filmes.
- Cada usuário pode ter somente uma avaliação por filme.
- O usuário pode editar sua nota e comentário.
- O modal de avaliações mostra as avaliações de todos os usuários.
- O modal de avaliação mostra somente a avaliação do usuário atual para aquele filme.
Concluído quando: criação, edição, média, contagem e restrição contra avaliações duplicadas funcionarem.
Fase 7 — Área Filmmaker e upload
Objetivo: permitir que os criadores gerenciem seus próprios filmes.
- [ ] FILM-01 Proteger /filmmaker para filmmaker e admin.
- [ ] FILM-02 Listar os filmes próprios do usuário, ativos e banidos.
- [ ] FILM-03 Se o usuário for admin, a página /filmmaker ainda deverá mostrar somente os filmes que ele próprio publicou.
- [ ] FILM-04 Mostrar o selo de banimento e sua justificativa.
- [ ] FILM-05 Implementar filtro por categoria.
- [ ] FILM-06 Implementar filtro por estado: todos, ativos e banidos.
- [ ] FILM-07 Implementar pesquisa por título.
- [ ] FILM-08 Criar o modal ou formulário de cadastro com título, sinopse, thumbnail, vídeo, classificação indicativa e múltiplas categorias.
- [ ] FILM-09 Validar campos obrigatórios no cliente e no servidor.
- [ ] FILM-10 Validar tipo, extensão, tamanho máximo e erros dos arquivos enviados.
- [ ] FILM-11 Fazer upload para um armazenamento apropriado e salvar no banco somente URLs/chaves e metadados.
- [ ] FILM-12 Tratar uploads parciais: não publicar um registro incompleto e permitir nova tentativa ou limpeza de arquivos órfãos.
- [ ] FILM-13 Persistir as relações entre filmes e categorias.
- [ ] FILM-14 Permitir editar filmes próprios.
- [ ] FILM-15 Permitir corrigir e reenviar filmes banidos, criando uma revisão pendente.
- [ ] FILM-16 Impedir a edição de filmes de terceiros, mesmo quando alguém alterar o ID enviado na URL ou requisição.
- [ ] FILM-17 Mostrar o estado da revisão: pendente, aprovada ou rejeitada, com a justificativa do admin quando rejeitada.
Regra importante para filmes banidos
Quando o filmmaker corrigir um filme banido e reenviá-lo:
1. O filme continua banido e indisponível no catálogo público.
2. A versão corrigida fica aguardando revisão administrativa.
3. O administrador compara o conteúdo anterior com a nova versão.
4. Se aprovar, o filme volta a ficar ativo.
5. Se rejeitar, o filme continua banido e uma nova justificativa é registrada.
6. O filmmaker consegue consultar o resultado da revisão.
Atenção: não sobrescreva a única cópia do conteúdo banido antes da decisão do administrador. Preserve os dados e arquivos anteriores ou armazene a proposta de correção separadamente.

Concluído quando: o filmmaker conseguir cadastrar, listar, editar e reenviar seus filmes com as permissões corretas.
Fase 8 — Administração
Objetivo: implementar o gerenciamento de usuários, categorias e moderação de filmes.
Usuários
- [ ] ADMIN-01 Criar os menus Usuários, Filmes e Categorias.
- [ ] ADMIN-02 Listar usuários com nome, e-mail e perfil.
- [ ] ADMIN-03 Permitir alterar o perfil entre user, filmmaker e admin.
- [ ] ADMIN-04 Validar as alterações de perfil no servidor.
- [ ] ADMIN-05 Considerar proteção contra a remoção acidental do último administrador.
Filmes e moderação
- [ ] ADMIN-06 Listar todos os filmes, ativos e banidos, para moderação global.
- [ ] ADMIN-07 Filtrar filmes por título e categoria.
- [ ] ADMIN-08 Adicionar uma ação para banir filmes.
- [ ] ADMIN-09 Criar o modal de banimento com nome do filme, justificativa obrigatória, cancelar e confirmar.
- [ ] ADMIN-10 Persistir o estado de banimento e a justificativa.
- [ ] ADMIN-11 Permitir que o administrador e o filmmaker responsável consultem a justificativa.
Revisões pendentes
- [ ] ADMIN-12 Criar uma área ou aba chamada “Revisões pendentes”.
- [ ] ADMIN-13 Exibir o card atualizado do filme, o motivo do banimento anterior e os dados novos para comparação.
- [ ] ADMIN-14 Permitir aprovar ou rejeitar a revisão.
- [ ] ADMIN-15 Ao aprovar, publicar a versão corrigida e reativar o filme.
- [ ] ADMIN-16 Ao rejeitar, manter o filme banido e exigir uma justificativa.
- [ ] ADMIN-17 Registrar quem revisou e quando.
- [ ] ADMIN-18 Preservar o motivo original do banimento e o motivo da rejeição da revisão como informações distintas.
- [ ] ADMIN-19 Permitir banir e desbanir filmes somente para administradores.
Categorias
- [ ] ADMIN-20 Implementar CRUD de categorias: criar, listar e renomear.
- [ ] ADMIN-21 Definir o comportamento ao excluir uma categoria associada a filmes.
- [ ] ADMIN-22 Impedir que o administrador edite ou exclua diretamente o conteúdo do filmmaker, conforme o escopo original.
Concluído quando: o administrador conseguir gerenciar usuários, categorias e moderação, incluindo o fluxo completo de revisão.
Fase 9 — Testes, segurança e entrega
Objetivo: preparar o sistema para uma demonstração confiável e avaliação técnica.
- [ ] QA-01 Testar cadastro, login, logout e redirecionamentos.
- [ ] QA-02 Testar acesso por URL e execução de ações com os três perfis.
- [ ] QA-03 Confirmar que usuários comuns não veem nem reproduzem filmes banidos.
- [ ] QA-04 Confirmar que filmmakers não alteram filmes de terceiros.
- [ ] QA-05 Confirmar que somente admins alteram perfis e moderam filmes.
- [ ] QA-06 Testar avaliação única, edição, média e contagem.
- [ ] QA-07 Testar upload inválido, arquivo grande, falha parcial e mídia indisponível.
- [ ] QA-08 Testar estados vazios, carregamento e erro.
- [ ] QA-09 Testar responsividade e acessibilidade básica dos modais.
- [ ] QA-10 Validar entradas com Zod ou mecanismo equivalente no servidor.
- [ ] QA-11 Confirmar que segredos não estão versionados.
- [ ] QA-12 Atualizar o README com instalação, .env.example, migrations, execução, perfis e limitações.
- [ ] QA-13 Executar lint, build e os testes disponíveis.
- [ ] QA-14 Demonstrar o fluxo completo: cadastro → login → catálogo → player → avaliação → upload → banimento → consulta da justificativa → reenvio → revisão administrativa.
Concluído quando: o fluxo principal estiver funcionando e documentado, sem falhas críticas de permissão.

Requisitos obrigatórios para não esquecer
Antes de considerar o projeto pronto, confira se estes pontos estão contemplados:
- [ ] Cadastro e login.
- [ ] Perfis user, filmmaker e admin.
- [ ] Catálogo com busca e categorias.
- [ ] Reprodução de filmes.
- [ ] Avaliações com notas de 0,5 a 5,0.
- [ ] Uma avaliação por usuário para cada filme, com possibilidade de edição.
- [ ] Cadastro e edição de filmes pelo filmmaker.
- [ ] Correção e reenvio de filmes banidos.
- [ ] Gestão de usuários e perfis pelo administrador.
- [ ] Gestão de categorias.
- [ ] Banimento com justificativa obrigatória.
- [ ] Fila de revisão de filmes corrigidos.
- [ ] Autorização no servidor para ações sensíveis.
- [ ] Validação segura de uploads.
- [ ] Interface responsiva.
- [ ] Tratamento de erros, carregamento e listas vazias.
- [ ] Documentação para executar o projeto.
Funcionalidades bônus — deixar para depois
Não comece por estas funcionalidades. Primeiro, entregue o MVP obrigatório.
- [-] Histórico e progresso de reprodução.
- [-] Séries e episódios.
- [-] Comentários independentes das avaliações.
- [-] Elenco e equipe técnica.
- [-] Recomendações personalizadas.
- [-] Login social.
- [-] Tema claro/escuro adicional.
- [-] Player customizado ou HLS avançado.
- [-] Funcionalidades sociais extras.


RF01 - ok
RF02


login ok 
cadastro de user ok
navbar + layout ok
alterar permissoes ok
adicionar categorias ok
remover categorias - ok 28/10
editar categorias - ok 28/10
cadastrar filmes - 
banir filmes - 
desbanir filmes - 
pagina inicial com filmes por categoria - 
criar page da categoria - 
mostrar para avaliar no player do video
fazer avaliações - 
mostar se ja foi avaliado ou não  - 

