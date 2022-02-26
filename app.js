



const express= require('express')
const app = express()
let http = require('http').Server(app)

const port = process.env.PORT || 3000

let io = require('socket.io')(http)
app.use(express.static('public'))

http.listen(port, () => {
    console.log('listening on port ', port)
})

io.on('connetion', socket => {
    console.log('a user is connected')

    socket.on('create or join ', room =>{
        console.log('create or join the room ', room)
        const myRoom = io.sockets.adapter.rooms[room] || {lenght: 0}
        const numClients = myRoom.lenght
        console.log(room, 'has', numClients, 'clients')

        if(numClients == 0){
            socket.join(room)
            socket.emit('created room: ', room)
        }else if(numClients == 1){
            socket.join(room)
            socket.emit('joined room: ', room)
        }else{
            socket.emit('room id: ', room, ' is full')
        }
    })

    socket.on('ready', room =>{
        socket.broadcast.to(room).emit('ready')
    })

    socket.on('candidate', event =>{
        socket.broadcast.to(event.room).emit('offer', event.sdp)
    })

    socket.on('after', event => {
        socket.broadcast.to(event.room).emit('answer', event.sdp)
    })

})