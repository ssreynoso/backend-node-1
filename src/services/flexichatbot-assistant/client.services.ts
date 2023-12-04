import { PDFsPerDayLimit, QuestionsPerDayLimit } from '../../constants/client'
import { DigitalOceanConstants } from '../../constants/digital_ocean'
import { ClientError } from '../../constants/errors/client'
import { paths } from '../../constants/paths'
import { T_Client, T_UpdateClientCallback } from '../../types/flexichatbot-assistant/clients'
import { ErrorClass } from '../../types/flexichatbot-assistant/errors'
import { getFormattedDate } from '../../utils/flexichatbot-assistant/date'
import { getCommonErrorObject } from '../../utils/flexichatbot-assistant/errors'
import { getFlatIP } from '../../utils/flexichatbot-assistant/getFlatIP'
import { DigitalOceanSpacesServices } from '../digital_ocean_spaces.services'

const DOSpacesServices = DigitalOceanSpacesServices.getInstance()
export class ClientsServices {
    private static instance: ClientsServices
    private folderPath: string
    private folderKey: string

    constructor() {
        this.folderPath = `${paths.database}/clients`
        this.folderKey = 'clients'
    }

    static getInstance() {
        if (!ClientsServices.instance) {
            ClientsServices.instance = new ClientsServices()
        }
        return ClientsServices.instance
    }

    private getFilePath(ip: string) {
        const flatIp = getFlatIP(ip)
        return `${this.folderPath}/${flatIp}.json`
    }

    private getFileKey(ip: string) {
        const flatIp = getFlatIP(ip)
        return `${this.folderKey}/${flatIp}.json`
    }

    async existClient(clientIP: string) {
        // Ahora las validaciones las hago contra Spaces de Digital Ocean (Hasta que incorpore una base de datos)
        const fileKey = this.getFileKey(clientIP)
        const exist   = await DOSpacesServices.existFile(DigitalOceanConstants.bucketName, fileKey)

        return exist
    }

    private async updateClient(ip: string, callback: T_UpdateClientCallback){
        try {
            const { data, error } = await this.getClient(ip)

            if (error) {
                throw error
            }

            const fileKey   = this.getFileKey(ip)
            const newClient = callback(data as T_Client)

            // await fs.promises.writeFile(filePath, JSON.stringify(newClient))
            const { error: updError } = await DOSpacesServices.uploadObject(
                DigitalOceanConstants.bucketName, // Nombre del bucket
                fileKey,                          // Key del archivo
                JSON.stringify(newClient)         // Contenido del archivo
            )

            if (updError) {
                throw updError
            }

            return { data: newClient, error: null }
            
        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async createClient(ip: string) {
        try {
            const fileKey = this.getFileKey(ip)
            const exist   = await this.existClient(ip)

            if (!exist) {
                const today = getFormattedDate(new Date())

                const newClient: T_Client = {
                    ip         : ip,
                    devices    : [],
                    browsers   : [],
                    suscription: 'free',
                    dayControls: [
                        {
                            day: today,
                            pdfsUploaded: 0,
                            questionsRequested: 0
                        }
                    ]
                }

                // await fs.promises.writeFile(filePath, JSON.stringify(newClient))
                const { error: createError } = await DOSpacesServices.uploadObject(
                    DigitalOceanConstants.bucketName, // Nombre del bucket
                    fileKey,                          // Key del archivo
                    JSON.stringify(newClient)         // Contenido del archivo
                )

                if (createError) {
                    throw createError
                }

                return { data: newClient, error: null }
            }

            return getCommonErrorObject({
                name: 'ExistingClient',
                description: 'The client already exists'
            })
        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async getClient(ip: string) {
        try {
            const exist = await this.existClient(ip)

            if (!exist) return getCommonErrorObject({
                name: 'NonExistingClient',
                description: 'The client does not exist'
            })

            const fileKey = this.getFileKey(ip)

            // Obtengo los datos existentes
            const { data: existingData, error } = await DOSpacesServices.downloadFile(DigitalOceanConstants.bucketName, fileKey)
            
            if (error) {
                throw error
            }

            // Ya confirmé que existe el archivo
            const client = JSON.parse(existingData as string) as T_Client

            return { data: client, error: null }
        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async newQuestion(ip: string) {
        const response = await this.updateClient(ip, (prevClient) => {
            const today         = getFormattedDate(new Date())
            const updatedClient = { ...prevClient }
            const control       = updatedClient.dayControls.find((value) => value.day === today)
            if (control) {
                control.questionsRequested += 1
            } else {
                updatedClient.dayControls.push({
                    day               : today,
                    pdfsUploaded      : 0,
                    questionsRequested: 1 
                })
            }

            return updatedClient
        })

        return response
    }

    async newPDF(ip: string, browserToken: string) {
        const response = await this.updateClient(ip, (prevClient) => {
            const today         = getFormattedDate(new Date())
            const updatedClient = { ...prevClient }
            const control       = updatedClient.dayControls.find((value) => value.day === today)

            if (control) {
                control.pdfsUploaded       += 1
                control.questionsRequested -= 1
            } else {
                updatedClient.dayControls.push({
                    day               : today,
                    pdfsUploaded      : 1,
                    questionsRequested: 0
                })
            }

            if (!updatedClient.browsers.includes(browserToken as string)){
                updatedClient.browsers.push(browserToken as string)
            }

            return updatedClient
        })

        return response
    }

    async getClientErrors(ip: string) {
        try {
            const exist = await this.existClient(ip)
            
            if (exist) {
                const response = await this.getClient(ip)
                const { data, error } = response

                if (error) {
                    return response
                }

                const client  = data as T_Client
                const today   = getFormattedDate(new Date())
                const control = client.dayControls.find((value) => value.day === today)

                if (!control) {
                    return null
                } else {
                    // Valido con respecto a la fecha de hoy.
                    const questionsError = this.questionsValidator(client)
                    if (questionsError) return questionsError

                    const PDFsError = this.PDFsValidator(client)
                    if (PDFsError) return PDFsError
                }
            }

            return null

        } catch (error) {
            return getCommonErrorObject(error as Error)
        }
    }

    questionsValidator(client: T_Client): Error | null {
        const today = getFormattedDate(new Date())
        const control = client.dayControls.find((value) => value.day === today)

        if (!control) {
            return new ErrorClass('NonExistingControl', 'The control per day does not exist')
        }

        if (control.questionsRequested >= QuestionsPerDayLimit) {
            return new ErrorClass('QuestionPerDayError', ClientError.QuestionPerDayError)
        }

        return null
    }

    PDFsValidator(client: T_Client): Error | null {
        const today = getFormattedDate(new Date())
        const control = client.dayControls.find((value) => value.day === today)

        if (!control) {
            return new ErrorClass('NonExistingControl', 'The control per day does not exist')
        }

        if (control.pdfsUploaded >= PDFsPerDayLimit) {
            return new ErrorClass('PDFsPerDayError', ClientError.PDFsPerDayError)
        }

        return null
    }
}
