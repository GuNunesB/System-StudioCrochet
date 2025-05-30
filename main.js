const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const pedidoModel = require('./src/models/Pedidos.js')

let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1200,
    height: 1000,

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
        label: 'Produtos',
        click: () => relatorioProdutos()
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

// CRUD CREATE ===================================================================================
ipcMain.on('create-pedido', async (event, newPedido) => {
  console.log(newPedido)

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
// FIM CRUD CREATE ===============================================================================

// CRUD READ =====================================================================================
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

      console.log(pedid)

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
    console.log("foi1")
      const pedid = await pedidoModel.find({
        cpfCliente: new RegExp(pedCpf, 'i')
      })

      console.log("foi2")
      console.log(pedid)
      console.log("foi3")

      if (pedid.length === 0) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Aviso',
          message: 'Pedido não encontrado.\nDeseja cadastrar esse pedido no nome deste cliente?',
          defaultId: 0,
          buttons: ['Sim', 'Não']
        }).then((result) => {
         if (result.response === 0) {
          console.log("foi10")
          event.reply('set-cpf')
          console.log("foi4")
         } else {
          console.log("foi11")
          event.reply('reset-form')

         }
        })
      } else {
        console.log("foi6")
        event.reply('render-pedid', JSON.stringify(pedid))
        console.log("foi5")
      }
      
  } catch (error) {
      console.log(error)
  }
})
// FIM CRUD READ =================================================================================

// CRUD DELETE ===================================================================================
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
// FIM CRUD DELETE ===============================================================================

// CRUD UPDATE ===================================================================================
ipcMain.on('update-pedido', async (event, pedido) => {
  try { 
    console.log("Foi main1")
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
      console.log("Foi main2")

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
  console.log("Foi main3")
})
// FIM CRUD UPDATE ===============================================================================

// Relatórios PDFs ==================================================================================
async function relatorioClientes() {
  try {
      // ================================================
      //          Configuração do documento pdf
      // ================================================

      // p (portrait)  l (landscape)
      // a4 (210 mm x 297 mm)
      const doc = new jsPDF('p', 'mm', 'a4')

      // inserir data atual no documento
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      // doc.setFontSize() tamanho da fonte em ponto(= word)
      doc.setFontSize(10)
      // doc.text() escreve um texto no documento
      doc.text(`Data: ${dataAtual}`, 170, 15) //( x,y (mm))
      doc.setFontSize(18)
      doc.text("Relatório de clientes", 15, 30)
      doc.setFontSize(12)
      let y = 50 //variável de apoio
      // cabeçalho da tabela
      doc.text("Nome", 14, y)
      doc.text("Telefone", 85, y)
      doc.text("E-mail", 130, y)
      y += 5
      // desenhar uma linha
      doc.setLineWidth(0.5)
      doc.line(10, y, 200, y) // (10 (inicio)_________ 200 (fim))
      y += 10

      // ================================================
      //  Obter a listagem de clientes(ordem alfabética)
      // ================================================

      const clientes = await clientModel.find().sort({ nomeCliente: 1 })
      // teste de recimento (Importante!)
      // console.log(clientes)
      // popular o documento pdf com os clientes cadastrados
      clientes.forEach((c) => {
          // criar uma nova página se y > 280mm (A4 = 297mm)
          if (y > 280) {
              doc.addPage()
              y = 20 //margem de 20mm para iniciar nova folha
              // cabeçalho da tabela
              doc.text("Nome", 14, y)
              doc.text("Telefone", 85, y)
              doc.text("E-mail", 130, y)
              y += 5
              // desenhar uma linha
              doc.setLineWidth(0.5)
              doc.line(10, y, 200, y) // (10 (inicio)_________ 200 (fim))
              y += 10
          }
          doc.text(c.nomeCliente, 15, y)
          doc.text(c.foneCliente, 85, y)
          doc.text(c.emailCliente, 130, y)
          y += 10
      })

      // ================================================
      //         Numeração automática de páginas
      // ================================================

      const pages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
          doc.setPage(i)
          doc.setFontSize(10)
          doc.text(`Página ${i} de ${pages}`, 105, 290, { align: 'center' })
      }

      // ================================================
      //    Abrir o arquivo pdf no sistema operacional
      // ================================================

      // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (importante!)
      const tempDir = app.getPath('temp')
      const filePath = path.join(tempDir, 'clientes.pdf')
      // salvar temporariamente o arquivo
      doc.save(filePath)
      // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
      shell.openPath(filePath)
  } catch (error) {
      console.log(error)
  }
}
// Fim Relatórios PDFs ==============================================================================