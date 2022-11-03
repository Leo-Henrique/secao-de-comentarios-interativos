# Desafio do Frontend Mentor | Seção de comentários interativos

Sendo exatamente a proposta do Frontend Mentor, este projeto é realmente desafiador para provar as habilidades em JavaScript. O principal objetivo deste desafio é simular as principais interações existentes em uma seção de comentários, chegando bem próximo dos comentários contidos nas redes sociais do dia a dia.

Esse desafio reforça muito a **lógica de programação**, ainda mais com alguns perfeiçoamentos que fiz por conta própria no projeto, pois requere que você escreva / execute cada bloco de código considerando o que já foi ou irá ser executado. Está mesma lógica com certeza foi o que mais foi trabalhado neste projeto, pois me mostrou a grande relevância e benefício de **pensar antes de escrever**.

![Captura de tela do projeto](https://user-images.githubusercontent.com/72027449/199724746-fd8fc499-bd6e-4992-9542-051378c85518.png)


## 📋 Índice

* [Visão geral](#-visão-geral)
    * [Status](#-status)
    * [O desafio](#-o-desafio)
    * [Links](#-acesse-o-projeto)
* [Desenvolvimento](#%EF%B8%8F-desenvolvimento)
    * [Tecnologias utilizadas](#-tecnologias-utilizadas)
    * [Aperfeiçoamentos](#aperfeiçoamentos)
            * [Criar perfil de usuário](#criar-perfil-de-usuário)
            * [Mensagens de erro ou sucesso](#mensagens-de-erro-ou-sucesso)
            * [Animações](#animações)
    * [Aprendizados](#-aprendizados)
        * [Lógica de programação](#lógica-de-programação)
        * [Classes e funções construtoras](#classes-e-funções-construtoras)
        * [Timestamp](#timestamp)

## 🔎 Visão geral

### ✅ Status

Finalizado.

### 🏁 O desafio

Para a resolução deste desafio, os usuários devem ser capazes de:

* Visualizar exatamente o layout proposto de acordo com o tamanho da janela de exibição (responsividade)
* Visualizar os estados – pairar, clicar ou selecionar – nos elementos interativos para uma usabilidade adequada
* Criar, ler, atualizar e excluir comentários e respostas
* Visualizar a data que seu comentário foi postado
* Avaliar comentários que não sejam de si próprio
* Visualizar os comentários atualizados mesmo recarregando a página ou saindo do navegador

### 🔗 Acesse o projeto

* [Link do projeto](https://leo-henrique.github.io/secao-de-comentarios-interativos/)
* [Desafio no Frontend mentor](https://www.frontendmentor.io/challenges/interactive-comments-section-iG1RugEG9)

## ⚙️ Desenvolvimento

### 💻 Tecnologias utilizadas

* HTML
* CSS / SASS
* Vanilla JavaScript

### 💡 Aperfeiçoamentos

Para chegar mais próximo de um exemplo real de uma seção de comentários – como os contidos nas redes sociais –, e pensando em melhorar a usabilidade, pensei em algumas melhorias não requiridas pelo Frontend Mentor.

#### Criar perfil de usuário

Na primeira renderização da página no navegador do usuário, eu exijo um nome que será armazenado no `localStorage` e utilizado quando a pessoa publicar um comentário. Aproveitei também para permitir que o mesmo usuário possa acrescentar uma foto de forma opcional.

Após acrescentar e confirmar um nome de usuário, a janela de criar um perfil é fechada, podendo ser reaberta pelo usuário no momento que desejar clicando sobre seu nome de usuário, exibido no canto superior direito da página.

https://user-images.githubusercontent.com/72027449/199782299-6783ca61-7011-4b29-af30-071151cfbe46.mp4

#### Mensagens de erro ou sucesso

Achei interessante em várias ocasiões exibir algumas mensagens ou avisos para evitar o usuário de ficar confuso. A maioria delas são exibidas no canto superior direito da página, mas algumas são exibidas em janela modal para chamar mais atenção (como o caso de cancelar as edições feitas em um comentário).

https://user-images.githubusercontent.com/72027449/199783415-50d3935f-91b9-43cb-996c-391e509fc324.mp4

#### Animações

Algo totalmente secundário, mas que dá um charme ao projeto, são as animações. Decidi acrescenta-las em praticamente todas as interações do usuário, como ao postar ou deletar um comentário, por exemplo.

A maioria delas é relacionada a uma transição de altura ou deslocamento. Apesar de a base ser feita com CSS, a aplicação é em JavaScript para priorizar valores exatos (como altura do elemento) e coloca-las em todas as ocasiões (não só ao exibir um elemento, mas também ao oculta-lo).

https://user-images.githubusercontent.com/72027449/199783872-489fb650-d6c9-4afe-a9e1-a898f29923f0.mp4

### 💡 Aprendizados

#### Lógica de programação

Como destacado na introdução deste readme, a lógica de programação foi o principal ponto trabalhado neste desafio. O conceito de *pensar antes de escrever* nunca foi tão aplicado por mim antes.

Separar o que é essencial do secundário; considerar o contexto que você vai escrever um novo bloco de código; considerar o que já foi e o que será executado após o seu novo código; reaproveitar funções e módulos que se encaixam em ocasiões diferentes. A junção de tudo isso foi pra mim, fatores essenciais para concluir este projeto exatamente com o resultado desejado.

#### Classes e funções construtoras

O uso das classes foi também um ponto chave no desenvolvimento do código deste projeto. Como uma alternativa de sintaxe da função construtora, as classes me permitiu uma clareza e organização do código como um todo de forma que eu nunca tinha aplicado antes.

Para exemplificar o uso, uma classe seria o comentário em si, com propriedades como id, usuário que postou, conteúdo do comentário e etc. Os métodos, toda a interação, como deletar, editar, avaliar e etc. Como eu precisava de objetos com as mesmas propriedades, já que o projeto inteiro é sobre comentários, mas valores diferentes nestas mesmas chaves, o uso das classes se encaixou perfeitamente nesta ocasião.

#### Timestamp

Também pude aproveitar o uso do método `Date.now()` para se basear na marca temporal do JavaScript na hora de setar as datas de publicações dos comentários. Apesar de não ser necessário neste desafio, é um aspecto positivo para considerar os fusos horários diferentes.

Além disso, fiz toda a formatação dessas datas para serem exibidas corretamente ao usuário, como por exemplo, verificar se o período (dia, semana etc) é o primeiro ou não para então mostrar a data no singular (1 dia atrás) ou plural (2 dias atrás).

Apesar de haver outras funções e retornos envolvidos para o resultado desejado, a função que formata as datas é a seguinte:
```js
const handleGrammar = (isPlural = true) => {
    const text = `${currentPeriod} ${periodName}`;
    const complement = "atrás";
    const plural = `${text}s ${complement}`;
    const single = `${text} ${complement}`;

    if (isPlural) {
        const pluralOfMonths = `${currentPeriod} meses ${complement}`;

        return periodName === "mês" ? pluralOfMonths : plural;
    } else {
        return single;
    }
}
```