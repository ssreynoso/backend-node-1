const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = http.createServer(app)

httpServer.listen(8088, () => {
    console.log('La app esta escuchando en el puerto 8088')
})

const io = new Server(httpServer, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    // cors: {
    //     origin: '*',
    // },
})

io.on('connect', (socket) => {
    console.log(`Se ha conectado el socket ${socket.id}`)
})


