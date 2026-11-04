Na parte de fazer o upload do video a arquitetura definida foi, o usuario vai ter o form para add todas infos do video + banner + videos, ao clicar para fazer o upload do video ele enviará primeiro a imagem ao servidor, depois o video, aqui temos 2 cenarios antes e depois.

antes:

o navegador enviava o video para o servidor e ele ficava armazenado na memoria ram, apos chegar todo o video lá ele comecava a escrever no disco. o problema disso é que videos mais longos de 8GB o servidor travava e era necessário reinicia-lo

Depois:

para resolver o problema, mudamos a forma como é enviado o video ao servidor em vez dele esperar subir todo na memoria ram, ele grava um frame na memoria e ela já vai para o disco, sem precisar sobrecarregar a memoria com o video inteiro