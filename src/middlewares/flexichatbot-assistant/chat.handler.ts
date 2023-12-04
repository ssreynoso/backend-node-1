import { NextFunction, Request, Response } from 'express'
import { ClientsServices } from '../../services/flexichatbot-assistant/client.services'
import { getPDFErrors } from '../../utils/flexichatbot-assistant/getPDFErrors'
import { getResponseErrorObject } from '../../utils/flexichatbot-assistant/errors'
import { ErrorClass } from '../../types/flexichatbot-assistant/errors'
import { HeadersErrors } from '../../constants/errors/headers'
import { T_Client } from '../../types/flexichatbot-assistant/clients'

const clientsServices = ClientsServices.getInstance()

export const PDFValidator = function (req: Request, res: Response, next: NextFunction) {
    try {
        if (req.files) {
            const fileList = req.files as Express.Multer.File[]
    
            fileList.forEach(async (file) => {
                // Controlo:
                const error = await getPDFErrors(file)
                
                if (error) throw error
            })
            
            // Si paso todo el forEach, quiere decir que no hubo errores
            next()
        }
    } catch (error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chat: null,
            error: errorObject
        })
    }
}

export const ClientValidator = async function (req: Request, res:Response, next: NextFunction) {
    try {
        const publicIP = req.clientIp

        if (!publicIP) throw new ErrorClass('MissingIP', HeadersErrors.noClientIP)
        
        // Controlo:
        const error = await clientsServices.getClientErrors(publicIP)
        
        if (error) {
            throw error
        }

        next()

    } catch(error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chat: null,
            error: errorObject
        })
    }
}

export const ClientQuestionValidator = async function (req: Request, res:Response, next: NextFunction) {
    try {
        const publicIP = req.clientIp

        if (!publicIP) throw new ErrorClass('MissingIP', HeadersErrors.noClientIP)
        
        // Controlo que puedo obtener el cliente
        const { data, error } = await clientsServices.getClient(publicIP)
        if (error) {
            throw error
        }

        const client = data as T_Client
        const validationError = clientsServices.questionsValidator(client)

        if (validationError){
            throw validationError
        }

        next()

    } catch(error) {
        const errorObject = getResponseErrorObject(error)
        res.status(400).json({ 
            chat: null,
            error: errorObject
        })
    }
}