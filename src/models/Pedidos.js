const { model, Schema } = require('mongoose')

const pedidoSchema = new Schema({
    nomeCliente: {
        type: String
    },
    enderecoCliente: {
        type: String
    },
    cpfCliente: {
        type: String,
        unique: true,
        index: true
    },
    telCliente: {
        type: String,
    },
    dataPedido: {
        type: Date,
        default: Date.now
    },
    produto: {
        type: String,
    },
    fio: {
        type: String,
    },
    referencias: {
        type: String,
    },
    preferencias: {
        type: String,
    },
    prazo: {
        type: Date
    },
    qtde: {
        type: String
    },
    valor: {
        type: String
    }
}, {versionKey: false})

module.exports = model('Pedidos', pedidoSchema)