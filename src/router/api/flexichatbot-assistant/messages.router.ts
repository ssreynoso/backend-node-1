import express from 'express'
import { ChatsServices } from '../../../services/flexichatbot-assistant/chats.services'
import { ClientsServices } from '../../../services/flexichatbot-assistant/client.services'
import { BrowserTokenHeader, ChatTokenHeader } from '../../../constants/headers'
import { HeadersErrors } from '../../../constants/errors/headers'
import { ClientQuestionValidator } from '../../../middlewares/flexichatbot-assistant/chat.handler'
import { ErrorClass } from '../../../types/flexichatbot-assistant/errors'
import { getResponseErrorObject } from '../../../utils/flexichatbot-assistant/errors'

const router         = express.Router()
const chatsServices  = ChatsServices.getInstance()
const clientServices = ClientsServices.getInstance()

// Nuevo mensaje
router.post('/',
    ClientQuestionValidator,
    async (req, res) => {
        try {
            const headers      = req.headers
            const browserToken = headers[BrowserTokenHeader] as string
            const chatToken    = headers[ChatTokenHeader] as string
            const publicIP     = req.clientIp as string
            
            if (!headers)      throw new Error(HeadersErrors.noHeader)
            if (!browserToken) throw new Error(HeadersErrors.noBrowserToken)
            if (!chatToken)    throw new Error(HeadersErrors.noChatToken)

            const { message } = req.body
            
            // Actualizo el chat
            const { data, error } = await chatsServices.newMessage(browserToken, chatToken, message as string)
            if (error) throw new ErrorClass(error.name, error.description)

            // Actualizo el cliente
            const { error: clientError } = await clientServices.newQuestion(publicIP as string)
            if (clientError) throw new ErrorClass(clientError.name, clientError.description)

            res.status(200).json({
                answer: data.lastMessage.content,
                error: null
            })

            return
        } catch (error) {
            const errorObject = getResponseErrorObject(error)
            res.status(400).json({ 
                chat: null,
                error: errorObject
            })
        }
    }
)

export default router