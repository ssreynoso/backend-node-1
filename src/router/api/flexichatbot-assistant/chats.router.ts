import fs        from 'fs'
import express   from 'express'
import multer    from 'multer'
import FormData  from 'form-data'
import fetch     from 'node-fetch'

// Routers
import messagesRouter from './messages.router'
import chatItemRouter from './chatItem.router'
import { ChatsServices } from '../../../services/flexichatbot-assistant/chats.services'
import { BrowsersServices } from '../../../services/flexichatbot-assistant/browsers.services'
import { ClientsServices } from '../../../services/flexichatbot-assistant/client.services'
import { DigitalOceanSpacesServices } from '../../../services/digital_ocean_spaces.services'
import { BrowserTokenHeader, ChatTokenHeader } from '../../../constants/headers'
import { HeadersErrors } from '../../../constants/errors/headers'
import { ErrorClass } from '../../../types/flexichatbot-assistant/errors'
import { getResponseErrorObject } from '../../../utils/flexichatbot-assistant/errors'
import { T_ChatSource } from '../../../types/flexichatbot-assistant/chats'
import { getUUID } from '../../../utils/flexichatbot-assistant/UUID'
import { paths } from '../../../constants/paths'
import { ClientValidator, PDFValidator } from '../../../middlewares/flexichatbot-assistant/chat.handler'
import { config } from '../../../config'
import { ChatError } from '../../../constants/errors/chat'
// Configuration

const router = express.Router()

const chatsServices    = ChatsServices.getInstance()
const browserServices  = BrowsersServices.getInstance()
const clientServices   = ClientsServices.getInstance()
const DOSpacesServices = DigitalOceanSpacesServices.getInstance()

// Utilizo router de mensajes
router.use('/message', messagesRouter)
router.use('/item', chatItemRouter)

router.get('/', async (req, res) => {
    try {
        const headers      = req.headers
        const browserToken = headers[BrowserTokenHeader]

        if (!headers)      throw new Error(HeadersErrors.noHeader)
        if (!browserToken) throw new Error(HeadersErrors.noBrowserToken)

        // Creo el navegador
        const existBrowser = await browserServices.existBrowser(browserToken as string)
        if (!existBrowser) {
            await browserServices.createBrowser(browserToken as string)
        }

        const response = await browserServices.getChats(browserToken as string)
        const { data: browserChats, error: browserError } = response
        if (browserError) {
            throw new ErrorClass(browserError.name, browserError.description)
        }

        const { data: chats, error: chatsError } = await chatsServices.getChatsDetails(browserChats)
        if (chatsError) {
            throw new ErrorClass(chatsError.name, chatsError.description)
        }

        res.status(200).json({
            chats: chats,
            error: null
        })
    } catch (error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chats: null,
            error: errorObject
        })
    }
})

let sources: T_ChatSource[] = []

// Configuración de multer para almacenar los archivos en una carpeta específica
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${paths.staticFiles}/pdfs`) // Carpeta donde se guardarán los archivos
    },
    filename: async function (req, file, cb) {
        const newID = getUUID()
        const newChatSource = {
            id      : newID,
            title   : file.originalname,
            path    : `${paths.staticFiles}/pdfs/${newID}.pdf`,
            fileName: `${newID}.pdf`,
            fileUrl : ''
        }
        sources.push(newChatSource)
        cb(null, newChatSource.fileName)
    },
})

// Crear el middleware de multer
const upload = multer({ storage })

// Creo un nuevo chat
router.post('/',
    ClientValidator,           // Valido que el cliente cumpla con los requerimientos
    upload.array('documents'), // Guardo los documentos en la carpeta de estáticos
    PDFValidator,              // Valido que los PDF cumplan con los requerimientos
    async (req, res) => {
        try {
            const headers      = req.headers
            const browserToken = headers[BrowserTokenHeader]
            const chatToken    = headers[ChatTokenHeader]
            const publicIP     = req.clientIp
            const encodedNames = JSON.parse(req.body['encoded-names'])

            if (!headers)      throw new Error(HeadersErrors.noHeader)
            if (!browserToken) throw new Error(HeadersErrors.noBrowserToken)
            if (!chatToken)    throw new Error(HeadersErrors.noChatToken)

            // Creo el cliente
            // console.log(`Creo el cliente ${chatToken}`)
            const existClient = await clientServices.existClient(publicIP as string)
            if (!existClient) {
                await clientServices.createClient(publicIP as string)
            }

            // Actualizo el cliente
            // console.log(`Actualizo newPDF ${chatToken}`)
            const { error: clientError } = await clientServices.newPDF(publicIP as string, browserToken as string)
            if (clientError) {
                throw new ErrorClass(clientError.name, clientError.description)
            }

            const formData = new FormData()

            let result: { success?: boolean } = { success: true }

            let chatFile: T_ChatSource | null = null

            if (req.files) {
                const fileList = req.files as Express.Multer.File[]

                const encodedName = encodedNames[0] || 'Error al guardar nombre del archivo'

                fileList.forEach((file) => {
                    const tempFile = sources.find((value) => value.fileName === file.filename)

                    if (tempFile) {
                        tempFile.title = encodedName
                        chatFile = tempFile
                    }

                    formData.append(
                        'document',
                        fs.createReadStream(file.path),
                        { filename: tempFile?.fileName || file.originalname }
                    )

                    formData.append('description', tempFile?.title || '')
                })
            }

            const custom_headers = {
                // 'browser-token': browserToken as string,
                'chat-token': chatToken as string,
                'authorization': `Bearer ${config.ACCESS_TOKEN}`
            }

            const requestOptions = {
                method: 'POST',
                headers: custom_headers,
                body: formData
            }

            const response = await fetch(`${config.PYTHON_SERVER}/documents`, requestOptions)
            result         = await response.json()

            if (result.success) {
                // Creo el navegador
                // console.log(`Creo el navegador ${chatToken}`)
                const existBrowser = await browserServices.existBrowser(browserToken as string)
                if (!existBrowser) {
                    await browserServices.createBrowser(browserToken as string)
                }

                // Creo el chat
                // console.log(`Creo el chat ${chatToken}`)
                const { data, error } = await chatsServices.createChat(chatToken as string, chatFile ? [chatFile] : [])
                if (error) {
                    throw new ErrorClass(error.name, error.description)
                }
                const newChat = data

                // Actualizo el navegador
                // console.log(`Actualizo el navegador (agrego el chat) ${chatToken}`)
                const { error: browserError } = await browserServices.addChat(browserToken as string, newChat.id)
                if (browserError) {
                    throw new ErrorClass(browserError.name, browserError.description)
                }

                // Proceso y cambio los sources.
                for (let i = 0; i < newChat.sources.length; i++) {
                    const source = newChat.sources[i]
                    
                    // Datos para digital ocean
                    const bucketName = 'flexichatbot-assistant'
                    const fileKey    = `pdfs/${source.fileName}`
                    const filePath   = `${paths.staticFiles}/pdfs/${source.fileName}`

                    const exist = await DOSpacesServices.existFile(bucketName, fileKey)

                    if (!exist) {
                        // Subo archivo a digital ocean con source.id
                        const uploadPDFResponse = await DOSpacesServices.uploadPDF(bucketName, fileKey, filePath)
                        const { error: uploadPDFError } = uploadPDFResponse
                        if (uploadPDFError) {
                            throw uploadPDFError
                        }
                    }

                    // Elimino el archivo local
                    await fs.promises.unlink(filePath)
                }
                
                sources = []

                res.status(200).json({
                    chat: newChat,
                    error: null
                })
                
                return
            }

            throw new Error(ChatError.item)
        } catch (error) {
            console.log(error)

            const errorObject = getResponseErrorObject(error)
            res.status(400).json({ 
                chat: null,
                error: errorObject
            })
        }
    }
)

export default router
