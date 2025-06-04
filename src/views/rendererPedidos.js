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


//==============================================================================
window.addEventListener('DOMContentLoaded', () => {
    const dadosSalvos = localStorage.getItem('pedidoSelecionado')
    if (dadosSalvos) {
        const pedido = JSON.parse(dadosSalvos)

        document.getElementById('inputIdPedido').value = pedido._id || ''
        document.getElementById('cliente').value = pedido.nomeCliente || ''
        document.getElementById('telefone').value = pedido.telCliente || ''
        document.getElementById('endereco').value = pedido.enderecoCliente || ''
        document.getElementById('produto').value = pedido.produto || ''
        document.getElementById('cpf').value = pedido.cpfCliente || ''
        document.getElementById('fio').value = pedido.fio || ''
        document.getElementById('referencia').value = pedido.referencias || ''
        document.getElementById('preferencia').value = pedido.preferencias || ''
        document.getElementById('quantidade').value = pedido.qtde || ''
        document.getElementById('valorTotal').value = pedido.valor || ''
        document.getElementById('dataPedido').value = formatarDataParaInput(pedido.dataPedido)
        document.getElementById('prazo').value = formatarDataParaInput(pedido.prazo)

        localStorage.removeItem('pedidoSelecionado') // limpa após carregar
    }
})

// Converte "2025-06-01T00:00:00.000Z" → "2025-06-01" (formato compatível com input date)
function formatarDataParaInput(data) {
    return new Date(data).toISOString().split('T')[0]
}

function verMais(pedido) {
    localStorage.setItem('pedidoSelecionado', JSON.stringify(pedido))
    window.location.href = './index.html' // ajuste se o caminho for diferente
}