let arrayCards = []

const list = document.getElementById('listarCards')

api.listarCards()

api.renderCards((event, cards) => {
    const renderCards = JSON.parse(cards)

    arrayCards = renderCards
    arrayCards.forEach((p) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }

        const dataPedidoBr = new Date(p.dataPedido).toLocaleDateString('pt-BR', options)
        const prazoBr = new Date(p.prazo).toLocaleDateString('pt-BR', options)

        list.innerHTML += `
            <div class="card mx-2 mt-3" style="width: 18rem; max-height: 600px;">
                <div class="card-body">
                    <p class="card-title idpedido">Id: ${p._id}</p>
                    <h6 class="card-title">Nome: ${p.nomeCliente}</h6>
                    <p class="pCard card-text">CPF: ${p.cpfCliente}</p>
                    <p class="pCard card-text">Telefone: ${p.telCliente}</p>
                    <p class="pCard card-text">Produto: ${p.produto}</p>
                    <p class="pCard card-text">Data do Pedido: ${dataPedidoBr}</p>
                    <p class="pCard card-text">Prazo de Entrega: ${prazoBr}</p>
                    <p class="pCard card-text">Qtde: ${p.qtde}</p>
                    <p class="pCard card-text">Valor: ${p.valor}</p>
                    <a class="btn btn-primary" onclick='verMais(${JSON.stringify(p)})'>+ Informações</a>
                </div>
            </div>
        `
    })
})