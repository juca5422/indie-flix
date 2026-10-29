IndieFlix — Blueprint oficial de permissões
1. Acesso às páginas
Página	USER	FILMMAKER	ADMIN
Home	Sim	Sim	Sim
Filmmaker — Meus filmes	Não	Sim	Sim
Admin — Filmes	Não	Não	Sim
Admin — Revisão	Não	Não	Sim

2. Filmmaker — Meus filmes
O critério principal é a autoria do filme, não o perfil de quem está acessando.

Tanto FILMMAKER quanto ADMIN veem os filmes que eles próprios publicaram.
Status	Aparece?	Ação disponível
PUBLISHED	Sim	Nenhuma
BANNED	Sim	Solicitar revisão
PENDING_REVIEW	Sim	Nenhuma

Assim, o administrador também pode solicitar revisão de um filme próprio que tenha sido banido, exatamente como um filmmaker comum.

Regra de segurança: a consulta deve filtrar pelo ID do criador autenticado. O usuário não deve conseguir visualizar ou solicitar revisão dos filmes de outro criador por meio dessa área.
3. Home — Catálogo público
Todos os perfis podem acessar, mas somente filmes publicados aparecem.
Status	Aparece?	Banner	Menu
PUBLISHED	Sim	Não	Não
BANNED	Não	Não	Não
PENDING_REVIEW	Não	Não	Não

4. Admin — Filmes
Aqui o administrador deixa de atuar como criador e assume o papel de moderador do catálogo inteiro.
Status	Aparece?	Ação
PUBLISHED	Sim	Banir
BANNED	Sim	Publicar filme
PENDING_REVIEW	Não	—

O administrador pode banir qualquer filme publicado ou publicar novamente qualquer filme banido, independentemente de quem o criou.
5. Admin — Revisão
Status	Aparece?	Ação
PUBLISHED	Não	—
BANNED	Não	—
PENDING_REVIEW	Sim	Publicar filme

Essa página reúne os filmes que aguardam análise do administrador, incluindo aqueles que foram enviados novamente para revisão pelos criadores.
6. Fluxo de estados
PUBLISHED

Home · Meus filmes · Admin — Filmes

Admin bane o filme
BANNED

Meus filmes · Admin — Filmes

Criador solicita revisão

PENDING_REVIEW

Admin — Revisão

Admin aprova
PUBLISHED

Filme volta ao catálogo público


Além desse fluxo, o administrador pode publicar diretamente um filme banido pela página Admin — Filmes, sem passar pela fila de revisão.