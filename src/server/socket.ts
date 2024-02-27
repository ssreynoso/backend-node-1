import { Server as HttpServer } from 'http'
import { Socket, Server } from 'socket.io'
import { T_Message } from '../types/message'
import { T_Chat } from '../types/chat'
import { IPerson } from '../types/person'
// import { getCompanyPeopleRoomKey } from '../utils/getCompanyPeopleRoomKey'

export class WebSocketsServer {
    public io: Server
    private companyRooms: string[]
    // private companyPeopleRooms: Map<string, string[]>
    private static instance: WebSocketsServer

    private constructor(server: HttpServer) {
        this.companyRooms = []
        // this.companyPeopleRooms = new Map()
        this.io = new Server(server, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                // Poner como una variable de entorno
                origin: ['https://appv2.flexichatbot.com', 'http://localhost:3000', 'https://app.flexibot.tech/'],
            },
        })

        this.io.on('connect', this.StartListeners.bind(this))
    }

    static getInstance(server?: HttpServer) {
        if (!WebSocketsServer.instance && server) {
            WebSocketsServer.instance = new WebSocketsServer(server)
        }
        return WebSocketsServer.instance
    }

    StartListeners(socket: Socket) {
        socket.on('init_client', (params: { empToken: string, loggedPerson: IPerson }) => {
            const { empToken } = params

            if (!this.companyRooms.includes(empToken)) {
                this.companyRooms.push(empToken)
            }

            // if (!this.companyPeopleRooms.has(empToken)) {
            //     this.companyPeopleRooms.set(empToken, [loggedPerson.PersonaId])
            // } else {
            //     const peopleRooms = this.companyPeopleRooms.get(empToken)
            //     if (peopleRooms && !peopleRooms.includes(loggedPerson.PersonaId)) {
            //         peopleRooms.push(loggedPerson.PersonaId)
            //     }
            // }

            // const companyPeopleRoomKey = getCompanyPeopleRoomKey(empToken, loggedPerson)

            // Tengo un room general de la empresa
            socket.join(empToken)
            // Tengo un room por personaId
            // socket.join(companyPeopleRoomKey)

            socket.emit('init_client', `socket ${socket.id} joined to room ${empToken}.`)
            // socket.emit('init_client', `socket ${socket.id} joined to room ${empToken} & ${companyPeopleRoomKey}.`)
        })

        socket.on('handshake', (callback: () => void, ) => {
            callback()
        })

        socket.on('disconnect', () => {
            socket.rooms.forEach((room) => {
                socket.leave(room)
            })
        })
    }

    NewMessage(empToken: string, chat: T_Chat, message: T_Message) {
        try {
            if (this.companyRooms.includes(empToken)) {
                // El nuevo mensaje pertenece a una empresa que existe y tengo un room.
                // Me tengo que fijar cuál es 


                this.io.to(empToken).emit('new_message', {
                    chat   : chat,
                    message: message
                })
            }

            return { response: '', error: null }
        } catch(error) {
            return { response: '', error: error }
        }
    }
}
