import fetch from 'node-fetch'
import { DigitalOceanSpacesServices } from '../digital_ocean_spaces.services'
import { paths } from '../../constants/paths'
import { DigitalOceanConstants } from '../../constants/digital_ocean'
import { T_Chat, T_ChatSource, T_UpdateChatCallback } from '../../types/flexichatbot-assistant/chats'
import { getCommonErrorObject } from '../../utils/errors'
import { config } from '../../config'
import { QueryResult } from '../../types/flexichatbot-assistant/types'
import { T_Message } from '../../types/flexichatbot-assistant/messages'

const DOSpacesServices = DigitalOceanSpacesServices.getInstance()
export class ChatsServices {
    private static instance: ChatsServices
    private folderPath: string
    private folderKey: string

    constructor() {
        this.folderPath = `${paths.database}/chats`
        this.folderKey  = 'chats'
    }

    static getInstance() {
        if (!ChatsServices.instance) {
            ChatsServices.instance = new ChatsServices()
        }
        return ChatsServices.instance
    }

    private getFilePath(chatToken: string) {
        return `${this.folderPath}/${chatToken}.json`
    }
    
    private getFileKey(chatToken: string) {
        return `${this.folderKey}/${chatToken}.json`
    }

    async existChat(chatToken: string) {
        // Ahora las validaciones las hago contra Spaces de Digital Ocean (Hasta que incorpore una base de datos)
        const fileKey = this.getFileKey(chatToken)
        const exist   = await DOSpacesServices.existFile(DigitalOceanConstants.bucketName, fileKey)

        return exist
    }

    private async updateChat(chatToken: string, callback: T_UpdateChatCallback){
        try {
            const response = await this.getChat(chatToken)
            const { data, error } = response

            if (error) {
                return response
            }

            const fileKey = this.getFileKey(chatToken)
            const newChat = callback(data as T_Chat)

            // await fs.promises.writeFile(filePath, JSON.stringify(newChat))
            const { error: updError } = await DOSpacesServices.uploadObject(
                DigitalOceanConstants.bucketName, // Nombre del bucket
                fileKey,                          // Key del archivo
                JSON.stringify(newChat)           // Contenido del archivo
            )
            
            if (updError) {
                throw updError
            }

            return { data: newChat, error: null }

        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async createChat(chatToken: string, sources: T_ChatSource[]) {
        try {
            const fileKey = this.getFileKey(chatToken)
            const exist   = await this.existChat(chatToken)

            if (!exist) {
                const newChat: T_Chat = {
                    id         : chatToken,
                    sources    : sources,
                    messages   : [],
                    lastMessage: { content: '', sender: 'bot' }
                }

                // await fs.promises.writeFile(filePath, JSON.stringify(newChat))
                const { error: createError } = await DOSpacesServices.uploadObject(
                    DigitalOceanConstants.bucketName, // Nombre del bucket
                    fileKey,                          // Key del archivo
                    JSON.stringify(newChat)           // Contenido del archivo
                )
    
                if (createError) {
                    throw createError
                }

                return { data: newChat, error: null }
            }

            return getCommonErrorObject({
                name: 'ExistingChat',
                description: 'The chat already exists'
            })
        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async getChat(chatToken: string) {
        try {
            const exist = await this.existChat(chatToken)

            if (!exist) return getCommonErrorObject({
                name: 'NonExistingChat',
                description: 'The chat does not exist'
            })
            
            const fileKey = this.getFileKey(chatToken)

            // Obtengo los datos existentes
            const response = await DOSpacesServices.downloadFile(DigitalOceanConstants.bucketName, fileKey)
            const { data: existingData, error } = response
            
            if (error) {
                throw error
            }
            
            const chat = JSON.parse(existingData as string) as T_Chat

            return { data: chat, error: null }
        } catch (error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async getChatsDetails(chatsIDs: string[]) {
        const chats: T_Chat[] = []

        for(let i = 0; i < chatsIDs.length; i++) {
            const response = await this.getChat(chatsIDs[i])
            const { data, error } = response
            if (error) {
                return response
            }
            chats.push(data as T_Chat)
        }

        return { data: chats, error: null }
    }

    async newMessage(browserToken: string, chatToken: string, input: string) {
        // Hago la pregunta a Python. Ahora langchain se encarga de consumir la api de openai
        const URL      = `${config.PYTHON_SERVER}/query?text=${input}&`
        const headers  = {
            // 'browser-token': browserToken,
            'chat-token': chatToken,
            'authorization': `Bearer ${config.ACCESS_TOKEN}`
        }
        const response = await fetch(URL, { method: 'GET', headers: headers })
        const result   = await response.json() as QueryResult

        if (result.error) {
            return getCommonErrorObject({
                name: 'InvalidRequest',
                message: result.error
            })
        }

        const res = await this.getChat(chatToken)
        const { error } = res
        if (error){
            return res
        }

        const completion = result.answer || null
        // const completion = await createChatCompletion(documents, input, chat.messages)
        
        if (completion) {
            const updateChatResponse = await this.updateChat(chatToken, (chat) => {
                const updatedChat = { ...chat }

                // Actualizo los mensajes del chat, no guardo el primer prompt
                if (chat.messages.length !== 0) {
                    const newMessage: T_Message = { sender: 'user', content: input }
                    updatedChat.messages.push(newMessage)
                    updatedChat.lastMessage = newMessage
                }

                // const parsedText = parseText(completion)
                // const answer     = parsedText[0].text
                const newMessage = { sender: 'bot', content: completion } as T_Message
                updatedChat.messages.push(newMessage)
                updatedChat.lastMessage = newMessage

                return updatedChat
            })

            return updateChatResponse
        }

        return getCommonErrorObject({
            name: 'CompletionError',
            message: 'An error has occurred while creating the chat completion'
        })
    }
}
