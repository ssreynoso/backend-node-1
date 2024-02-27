import express, { Application } from 'express'
import { WebSocketsServer } from '../../server/socket'

export const routerSockets = function (app: Application, webSocketsServer: WebSocketsServer) {
    const router_sockets_v1 = express.Router()

    app.use('/sockets/v1', router_sockets_v1)

    router_sockets_v1.post('/message', (req, res) => {
        try {
            const { EmpToken, Chat, Message } = req.body

            if (!EmpToken) throw new Error('No existe EmpToken')
            if (!Chat)     throw new Error('No existe Chat')
            if (!Message)  throw new Error('No existe Message')

            const { response, error } = webSocketsServer.NewMessage(EmpToken, Chat, Message)

            if (error) {
                throw error
            }

            res.status(200).send({ response, error })
        } catch (error) {
            res.status(500).send({ error })
        }
    })
    
}
