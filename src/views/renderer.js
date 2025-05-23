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
let tel = document.getElementById('cliente')
let email = document.getElementById('telefone')
let senha = document.getElementById('endereco')
let cep = document.getElementById('produto')
let cidade = document.getElementById('cpf')
let uf = document.getElementById('fio')
let logradouro = document.getElementById('referencia')
let bairro = document.getElementById('preferencia')
let cpf = document.getElementById('quantidade')
let complemento = document.getElementById('prazo')
let idClient = document.getElementById('inputIdClient')