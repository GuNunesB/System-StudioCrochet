const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const pedidoModel = require('./src/models/Pedidos.js')

const { jspdf, default: jsPDF } = require('jspdf')

let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1300,
    height: 1100,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

  win.loadFile('./src/views/index.html')
}

let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'

  const mainWindow = BrowserWindow.getFocusedWindow()

  if (mainWindow) {
    about = new BrowserWindow({
      width: 415,
      height: 350,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, './preload.js')
      }
    })
  }


  about.loadFile('./src/views/sobre.html')

  ipcMain.on('about-exit', () => {
    if (about && !about.isDestroyed()) {
      about.close()
    }
   
  })
}


app.whenReady().then(() => {
  createWindow()

  ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar()
    if (conectado) {
      setTimeout(() => {
        event.reply('db-status', "conectado")
      }, 500)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')
 
const templete = [
  {
    label: 'Home',
    submenu: [
      {
        label: 'Voltar',
        accelerator: 'Esc',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow()
          if (focusedWindow && focusedWindow.webContents.canGoBack()) {
            focusedWindow.webContents.goBack()
          }
        }
      }
    ]
  },
  {
    label: 'Relatórios PDFs',
    submenu: [
      {
        label: 'Pedidos',
        click: () => relatorioPedidos()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Ampliar',
        role: 'zoomIn',
        accelerator: 'Ctrl+='
      },
      {
        label: 'Reduzir',
        role: 'zoomOut',
        accelerator: 'Ctrl+-'
      },
      {
        label: 'Tamanho padrão',
        role: 'resetZoom',
        accelerator: 'Ctrl+0'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools',
        accelerator: 'Ctrl+Shift'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/GuNunesB/System-StudioCrochet')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

ipcMain.on('create-pedido', async (event, newPedido) => {

  try {
    const newPedidos = pedidoModel({
      nomeCliente: newPedido.nomeCli,
      enderecoCliente: newPedido.enderecoCli,
      cpfCliente: newPedido.cpfCli,
      telCliente: newPedido.telCli,
      dataPedido: newPedido.dataPed,
      produto: newPedido.produto,
      fio: newPedido.fio,
      referencias: newPedido.refs,
      preferencias: newPedido.prefs,
      prazo: newPedido.prazo,
      qtde: newPedido.qtde,
      valor: newPedido.valor
    })

    await newPedidos.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Pedido feito com sucesso.",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })

  } catch (error) {
    dialog.showMessageBox({
      type: 'error',
      title: "Atenção!",
      message: "Há algum erro. \nVerifique as informações digitadas.",
      buttons: ['OK']
    })
    
    console.log(error)
  }
})

ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
      type: 'warning',
      title: 'Atenção',
      message: 'Preencha o campo de busca',
      buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, pedName) => {
  try {
      const pedid = await pedidoModel.find({
        nomeCliente: new RegExp(pedName, 'i')
      })

      if (pedid.length === 0) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Aviso',
          message: 'Pedido não encontrado.\nDeseja cadastrar esse pedido?',
          defaultId: 0,
          buttons: ['Sim', 'Não']
        }).then((result) => {
         if (result.response === 0) {
          event.reply('set-name')
          
         } else {
          event.reply('reset-form')

         }
        })
      } else {
        event.reply('render-pedid', JSON.stringify(pedid))
      }
      
  } catch (error) {
      console.log(error)
  }
})

ipcMain.on('search-cpf', async (event, pedCpf) => {
  try {
      const pedid = await pedidoModel.find({
        cpfCliente: new RegExp(pedCpf, 'i')
      })

      if (pedid.length === 0) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Aviso',
          message: 'Pedido não encontrado.\nDeseja cadastrar esse pedido no nome deste cliente?',
          defaultId: 0,
          buttons: ['Sim', 'Não']
        }).then((result) => {
         if (result.response === 0) {
          event.reply('set-cpf')
         } else {
          event.reply('reset-form')

         }
        })
      } else {
        event.reply('render-pedid', JSON.stringify(pedid))
      }
      
  } catch (error) {
      console.log(error)
  }
})

ipcMain.on('delete-pedido', async (event, id) => {
  const result = await dialog.showMessageBox(win, {
      type: 'warning',
      title: "Atenção!",
      message: "Tem certeza que deseja excluir este pedido?\nEsta ação não poderá ser desfeita.",
      buttons: ['Cancelar', 'Excluir']
  })
  if (result.response === 1) {
      try {
          const delPedido = await pedidoModel.findByIdAndDelete(id)
          event.reply('reset-form')
      } catch (error) {
          console.log(error)
      }
  }
})

ipcMain.on('update-pedido', async (event, pedido) => {
  try { 
      const updatePedido = await pedidoModel.findByIdAndUpdate(
        pedido.idPedido,
          {
            nomeCliente: pedido.nomeCli,
            enderecoCliente: pedido.enderecoCli,
            cpfCliente: pedido.cpfCli,
            telCliente: pedido.telCli,
            dataPedido: pedido.dataPed,
            produto: pedido.produto,
            fio: pedido.fio,
            referencias: pedido.refs,
            preferencias: pedido.prefs,
            prazo: pedido.prazo,
            qtde: pedido.qtde,
            valor: pedido.valor
          },
          {
              new: true
          }
      )

      dialog.showMessageBox({
          type: 'info',
          title: "Aviso",
          message: "Dados alterados com sucesso",
          buttons: ['OK']
      }).then((result) => {
          if (result.response === 0) {
              event.reply('reset-form')
          }
      })
  } catch (error) {
    dialog.showMessageBox({
      type: 'error',
      title: "Atenção!",
      message: "Há algum erro.\nVerifique as informações digitadas.",
      buttons: ['OK']
    })
    console.log(error)
  }
})

async function relatorioPedidos() {
  try {
      const doc = new jsPDF('p', 'mm', 'a4')

      const dataAtual = new Date().toLocaleDateString('pt-BR')
      
      doc.setFontSize(10)

      doc.text(`Data: ${dataAtual}`, 170, 15)
      doc.setFontSize(18)
      doc.text("Relatório de Pedidos", 15, 30)
      
      doc.setFontSize(11)
      let y = 50 

      doc.text("Cliente", 17, y)
      doc.text("Telefone", 62, y)
      doc.text("Produto", 94, y)
      doc.text("Qtde", 165, y)
      doc.text("Valor", 184, y)
      
      y += 5

      doc.setLineWidth(0.5)
      doc.line(10, y, 200, y)
      y += 10
      
      const pedidos = await pedidoModel.find().sort({ nomeCliente: 1 })
      
      pedidos.forEach((p) => {
          if (y > 280) {
              doc.addPage()

              y = 20

              doc.text("Cliente", 17, y)
              doc.text("Telefone", 62, y)
              doc.text("Produto", 94, y)
              doc.text("Quantidade", 165, y)
              doc.text("Valor", 184, y)

              y += 5

              doc.setLineWidth(0.5)
              doc.line(10, y, 200, y)
              y += 10
          }

          doc.text(p.nomeCliente, 17, y)
          doc.text(p.telCliente, 62, y)
          doc.text(p.produto, 94, y)
          doc.text(p.qtde, 168, y)
          doc.text(p.valor, 184, y)

          y += 10
      })
      const pages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
          doc.setPage(i)
          doc.setFontSize(10)
          doc.text(`Página ${i} de ${pages}`, 105, 290, { align: 'center' })
      }

      const tempDir = app.getPath('temp')
      const filePath = path.join(tempDir, 'pedidos.pdf')
    
      doc.save(filePath)

      shell.openPath(filePath)
  } catch (error) {
      console.log(error)
  }
}

ipcMain.on('listar-cards', async (event) => {
  try {
    const cards = await pedidoModel.find()
    event.reply('render-cards', JSON.stringify(cards))
  } catch (error) {
    console.log(error)
  }
})