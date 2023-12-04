import express from 'express'
import { BrowsersServices } from '../../../services/flexichatbot-assistant/browsers.services'
import { BrowserTokenHeader, ChatTokenHeader } from '../../../constants/headers'
import { ChatsServices } from '../../../services/flexichatbot-assistant/chats.services'
import { ErrorClass } from '../../../types/flexichatbot-assistant/errors'
import { HeadersErrors } from '../../../constants/errors/headers'
import { getResponseErrorObject } from '../../../utils/flexichatbot-assistant/errors'

const router = express.Router()

const browserServices = BrowsersServices.getInstance()
const chatsServices   = ChatsServices.getInstance()

router.get('/', async (req, res) => {
    try {
        const headers      = req.headers
        const browserToken = headers[BrowserTokenHeader]
        const chatToken    = headers[ChatTokenHeader]

        if (!headers)      throw new ErrorClass('NoHeader', HeadersErrors.noHeader)
        if (!browserToken) throw new ErrorClass('NoBrowserToken', HeadersErrors.noBrowserToken)
        if (!chatToken)    throw new ErrorClass('NoChatToken', HeadersErrors.noChatToken)

        const hasChat = await browserServices.hasChat(browserToken as string, chatToken as string)

        if (!hasChat) throw new ErrorClass('NonExistingChat', 'The chat does not exist')

        const response = await chatsServices.getChat(chatToken as string)
        const { data, error } = response

        if (error) throw new ErrorClass(error.name, error.description)

        res.status(200).json({
            chat: data,
            error: null
        })
    } catch (error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chat: null,
            error: errorObject
        })
    }
})

router.get('/messages', async (req, res) => {
    try {
        const headers      = req.headers
        const browserToken = headers[BrowserTokenHeader]
        const chatToken    = headers[ChatTokenHeader]

        if (!headers)      throw new Error(HeadersErrors.noHeader)
        if (!browserToken) throw new Error(HeadersErrors.noBrowserToken)
        if (!chatToken)    throw new Error(HeadersErrors.noChatToken)

        const hasChat = await browserServices.hasChat(browserToken as string, chatToken as string)

        if (!hasChat) throw new ErrorClass('NonExistingChat', 'The chat does not exist')

        const response = await chatsServices.getChat(chatToken as string)
        const { data, error } = response

        if (error) throw new ErrorClass(error.name, error.description)

        res.status(200).json({
            chat: data,
            error: null
        })
    } catch (error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chat: null,
            error: errorObject
        })
    }
})

export default router