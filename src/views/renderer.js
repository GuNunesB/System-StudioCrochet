console.log("Processo de renderização")

function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

api.dbStatus((event, message) => {
    if (message === "conectado") {
        document.getElementById('icondb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('icondb').src = "../public/img/dboff.png"
    }
})

const foco = document.getElementById('barraBuscar')

document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true

    btnCreate.disabled = false

    foco.focus()
})

let form = document.getElementById('form')
let dataPedido = document.getElementById('dataPedido')
let nome = document.getElementById('cliente')
let tel = document.getElementById('telefone')
let endereco = document.getElementById('endereco')
let produto = document.getElementById('produto')
let cpf = document.getElementById('cpf')
let fio = document.getElementById('fio')
let refs = document.getElementById('referencia')
let prefs = document.getElementById('preferencia')
let qtde = document.getElementById('quantidade')
let prazo = document.getElementById('prazo')
let valor = document.getElementById('valorTotal')
let idPedido = document.getElementById('inputIdPedido')

function validarCPF() {
    let cpfInput = document.getElementById('cpf');
    let cpfErro = document.getElementById('cpfErro');
    let cpf = cpfInput.value.replace(/\D/g, '');

    cpfErro.textContent = "";
    cpfInput.style.border = "";

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        cpfErro.textContent = "CPF inválido! Insira um CPF válido.";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        cpfErro.textContent = "CPF inválido!";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        cpfErro.textContent = "CPF inválido!";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    cpfInput.style.border = "2px solid green";
    return true;
}

//++ Decifrar +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        searchPed()
    }
}

    form.addEventListener('keydown', teclaEnter)

function restaurarEnter() {
    form.removeEventListener('keydown', teclaEnter)
}

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (idPedido.value === "") {
        const newPedido = {
            nomeCli: nome.value,
            enderecoCli: endereco.value,
            cpfCli: cpf.value,
            telCli: tel.value,
            dataPed: dataPedido.value,
            produto: produto.value,
            fio: fio.value,
            refs: refs.value,
            prefs: prefs.value,
            prazo: prazo.value,
            qtde: qtde.value,
            valor: valor.value
        }

        api.addPedido(newPedido)
    } else {
        console.log("Foi Renderer1")
        const pedido = {
            idPedido: idPedido.value,
            nomeCli: nome.value,
            enderecoCli: endereco.value,
            cpfCli: cpf.value,
            telCli: tel.value,
            dataPed: dataPedido.value,
            produto: produto.value,
            fio: fio.value,
            refs: refs.value,
            prefs: prefs.value,
            prazo: prazo.value,
            qtde: qtde.value,
            valor: valor.value
        }
        console.log("Foi Renderer2")
        api.updatePedido(pedido)
        console.log("Foi Renderer3")
    }    
})

function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})

function resetCpf() {
    const ErroCpf = document.getElementById('cpf')
    ErroCpf.style.border = "2px solid red";
    ErroCpf.value = ""
    ErroCpf.focus()

}


api.resetCpf((args) => {
    resetCpf()
})

api.setName((args) => {
    let busca = document.getElementById('barraBuscar').value

    foco.value=""

    nome.focus()    
    nome.value = busca

    restaurarEnter()
})

api.setCpf((args) => {
    let busca = document.getElementById('barraBuscar').value
 
    foco.value=""

    cpf.focus()
    cpf.value = busca

    restaurarEnter()
})

function buscarPedido() {
    console.log()
    let searchValue = document.getElementById('barraBuscar').value
    if (searchValue === "") {
        api.validateSearch()

    } else {

        const isCPF = !isNaN(searchValue)

        if (isCPF) {
            api.searchCpf(searchValue)
        } else {
            api.buscarPedido(searchValue)
        }
        api.renderPedido((event, pedid) => {
            const pedidoData = JSON.parse(pedid)

            arrayPedid = pedidoData

            arrayPedid.forEach((p) => {
                nome.value = p.nomeCliente
                endereco.value = p.enderecoCliente
                cpf.value = p.cpfCliente
                tel.value = p.telCliente
                dataPedido.value = p.dataPedido
                produto.value = p.produto
                fio.value = p.fio
                refs.value = p.referencias
                prefs.value = p.preferencias
                prazo.value = p.prazo
                qtde.value = p.qtde
                valor.value = p.valor
                idPedido.value = p._id

                restaurarEnter()
                btnUpdate.disabled = false
                btnDelete.disabled = false
            })
        })
    }
}

function removePedido() {
    api.deletePedido(idPedido.value)
}

function fechar() {
    api.aboutExit()
}