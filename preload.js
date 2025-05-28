const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    addPedido: (newPedido) => ipcRenderer.send('create-pedido', newPedido),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    resetCpf: (args) => ipcRenderer.on('reset-cpf', args),
    buscarPedido: (pedName) => ipcRenderer.send('search-name', pedName),
    searchCpf: (pedCpf) => ipcRenderer.send('search-cpf', pedCpf),
    renderPedido: (pedid) => ipcRenderer.on('render-pedid', pedid),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (args) => ipcRenderer.on('set-name', args),
    setCpf: (args) => ipcRenderer.on('set-cpf', args),
    deletePedido: (id) => ipcRenderer.send('delete-pedido', id),
    updatePedido: (pedido) => ipcRenderer.send('update-pedido', pedido)
})