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
        searchName()
    }
}

    formCli.addEventListener('keydown', teclaEnter)

function restaurarEnter() {
    formCli.removeEventListener('keydown', teclaEnter)
}

formCli.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (idClient.value === "") {
        const newCliente = {
            nomeCli: nome.value,
            telCli: tel.value,
            emailCli: email.value,
            senhaCli: senha.value,
            cepCli: cep.value,
            cidadeCli: cidade.value,
            ufCli: uf.value,
            logradouroCli: logradouro.value,
            bairroCli: bairro.value,
            cpfCli: cpf.value,
            complementoCli: complemento.value
        }

        api.addCliente(newCliente)
    } else {
        const cliente = {
            idCli: idClient.value,
            nomeCli: nome.value,
            telCli: tel.value,
            emailCli: email.value,
            senhaCli: senha.value,
            cepCli: cep.value,
            cidadeCli: cidade.value,
            ufCli: uf.value,
            logradouroCli: logradouro.value,
            bairroCli: bairro.value,
            cpfCli: cpf.value,
            complementoCli: complemento.value
        }
        
        api.updateClient(cliente)
    }    
})

//++ Decifrar Pt.2 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
    let busca = document.getElementById('searchClient').value

    foco.value=""

    nome.focus()    
    nome.value = busca

    restaurarEnter()
})

api.setCpf((args) => {
    let busca = document.getElementById('searchClient').value
 
    foco.value=""

    cpf.focus()
    cpf.value = busca

    restaurarEnter()
})

function searchName() {
    let searchValue = document.getElementById('searchClient').value
    if (searchValue === "") {
        api.validateSearch()

    } else {

        const isCPF = !isNaN(searchValue)

        if (isCPF) {
            api.searchCpf(searchValue)
        } else {
            api.searchName(searchValue)
        }
        api.renderClient((event, client) => {
            const clientData = JSON.parse(client)

            arrayClient = clientData

            arrayClient.forEach((c) => {
                nome.value = c.nomeCliente
                cpf.value = c.cpf
                email.value = c.email
                tel.value = c.telCliente
                cep.value = c.cep
                logradouro.value = c.logradouro
                senha.value = c.senha
                complemento.value = c.complemento
                bairro.value = c.bairro
                cidade.value = c.cidade
                uf.value = c.uf
                idClient.value = c._id

                restaurarEnter()
                btnUpdate.disabled = false
                btnDelete.disabled = false
            })
        })
    }
}

function removeClient() {
    api.deleteClient(idClient.value)
}

function fechar() {
    api.aboutExit()
}