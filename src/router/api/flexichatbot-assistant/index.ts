import express from 'express'
import generalRouter from './general.router'
import chatsRouter from './chats.router'
import staticRouter from './static.router'

const FlexiChatBotAssistantRouter = express.Router()

FlexiChatBotAssistantRouter.use('/', generalRouter)
FlexiChatBotAssistantRouter.use('/', staticRouter)
FlexiChatBotAssistantRouter.use('/chats', chatsRouter)

export default FlexiChatBotAssistantRouter
