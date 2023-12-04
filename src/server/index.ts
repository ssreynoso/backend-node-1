import express, { Application, Request, Response } from 'express'
import http, {Server as HttpServer} from 'http'
import requestIp from 'request-ip'
import cors from 'cors'
import { routerApi } from '../router/api'
import { config } from '../config'
import { WebSocketsServer } from './socket'
import { routerSockets } from '../router/sockets'

export class Server {
    private app             : Application
    private httpServer      : HttpServer
    private port            : string
    private webSocketsServer: WebSocketsServer

    constructor() {
        this.app              = express()
        this.httpServer       = http.createServer(this.app)
        this.port             = config.APP_PORT
        this.webSocketsServer = WebSocketsServer.getInstance(this.httpServer)

        this.middlewares()
        this.routes()
        this.notFoundMiddleware()
    }

    private middlewares() {
        // CORS
        // this.app.use(cors({ origin: ['https://appv2.flexichatbot.com'] }))
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(requestIp.mw())
    }

    private routes() {
        routerApi(this.app)
        routerSockets(this.app, this.webSocketsServer)
    }

    private notFoundMiddleware() {
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: 'not found' })
        })
    }

    listen() {
        try {
            this.httpServer.listen(this.port, () => {
                console.log(`Server running on http://localhost:${this.port}`)
            })
        } catch (error) {
            if (error instanceof Error) console.log(`Error occurred: ${error.message}`)
        }
    }
}
