// MODULE IMPORTS
const ethers          = require('ethers')
const express         = require('express')
const app             = express()
const http            = require('http').Server(app)
const io              = require('socket.io')(http)
const Etherbots       = require('./contracts/Etherbots.json')

// VARS
let provider = ethers.providers.getDefaultProvider()
let address = '0xd2f81cd7a20d60c0d558496c7169a20968389b40'
let contract = new ethers.Contract(address, Etherbots.result, provider)
let totalSupply

// EXPRESS
app.set('view engine', 'pug')
app.use(express.static('public'))

// SOCKET
io.on('connection', (socket) => {

  socket.emit('connected')

  totalSupply = (msg) => {
    contract.totalSupply().then((data) => {
      let supply = data.toString()
      console.log('total supply', supply)
      socket.emit('bots:supply', {
        success: true,
        data: supply
      })
    }).catch((err) => {
      console.log('Error calling total supply', err)
      socket.emit('bots:supply', {
        success: false,
        data: err
      })
    })
  }

  socket.on('disconnect', () => {
    socket.emit('disconnected')
  })

})

// ROUTING
app.get('/', (req, res) => {
  totalSupply()
  res.render(__dirname + '/client/index.pug')
})

// START SERVER
http.listen(3000, () => {
  console.log('listening on port 3000')
})
