1- SetInterval, clearInterval -> são funcoes que posso usar para executar uma função de tempo em tempo no navegador.

2 - UseEffect -> eu utilizo quando quero executar uma ação apos toda a pagina carregar

3 - ZOD -> o mapeamento do zod é apenas para os dados que vem do usuario (sabia que ele fazia validação mas n como e de qual lado) e para usa-lo na função criamos a const validation e chamo o safeparse do zod com o schema que preciso validar assim ela retorna se está tudo certo ou não

4 - Importancia do HTTPS -> sem ele os dados estão desportegidos ao enviar para o servidor, é possivel fazer um man-in-the-middle para capaturar os pacotes com dados sensiveis como senhas, e sessoes

5- certificado SSL -> para termos HTTPS precisamos ter um certificado SSL que é o que criptografa todo o pacote até chegar no servidor, mas existe uma questão, quem emmite os certificados são as CAs e temos as reconhecidas mundialmente , e as locais criadas por nós, para ter um certificado SSL de uma CA mundial precisamos ter ou um DNS ou um ip publico para que sejá possivel fazer a prova ACME para validar o certificado, ou seja em lab sem dominio e ip publico n tem como usa-la.
Podemos criar no CA-interna e não precisar fazer o ACME, porem todas as pessoas da rede que acessarem aquele site, obrigatoriamente tem que instalar o certificado para ser reconhecido se não n consegue acessar o site



