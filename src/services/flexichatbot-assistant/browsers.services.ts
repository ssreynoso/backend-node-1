import { DigitalOceanConstants } from '../../constants/digital_ocean'
import { paths } from '../../constants/paths'
import { T_Browser, T_UpdateBrowserCallback } from '../../types/flexichatbot-assistant/browsers'
import { getCommonErrorObject } from '../../utils/errors'
import { DigitalOceanSpacesServices } from '../digital_ocean_spaces.services'

const DOSpacesServices = DigitalOceanSpacesServices.getInstance()

export class BrowsersServices {
    private static instance: BrowsersServices
    private folderPath: string
    private folderKey: string

    constructor() {
        this.folderPath = `${paths.database}/browsers`
        this.folderKey = 'browsers'
    }

    static getInstance() {
        if (!BrowsersServices.instance) {
            BrowsersServices.instance = new BrowsersServices()
        }
        return BrowsersServices.instance
    }

    private getFilePath(browserToken: string) {
        return `${this.folderPath}/${browserToken}.json`
    }

    private getFileKey(browserToken: string) {
        return `${this.folderKey}/${browserToken}.json`
    }
    
    async existBrowser(browserToken: string): Promise<boolean> {
        // Ahora las validaciones las hago contra Spaces de Digital Ocean (Hasta que incorpore una base de datos)
        const fileKey = this.getFileKey(browserToken)
        const exist   = await DOSpacesServices.existFile(DigitalOceanConstants.bucketName, fileKey)

        return exist
    }

    private async updateBrowser(browserToken: string, callback: T_UpdateBrowserCallback) {
        try {
            const response        = await this.getBrowser(browserToken)
            const { data, error } = response

            if (error) {
                return { data: null, error }
            }

            const fileKey    = this.getFileKey(browserToken)
            const newBrowser = callback(data as T_Browser)

            // await fs.promises.writeFile(filePath, JSON.stringify(newBrowser))
            const updResponse = await DOSpacesServices.uploadObject(
                DigitalOceanConstants.bucketName, // Nombre del bucket
                fileKey,                          // Key del archivo
                JSON.stringify(newBrowser)        // Contenido del archivo
            )
            const { error: updError } = updResponse

            if (updError) {
                throw updError
            }

            return { data: newBrowser, error: null }

        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async createBrowser(browserToken: string) {
        try {
            const fileKey = this.getFileKey(browserToken)
            const exist   = await this.existBrowser(browserToken)

            if (!exist) {
                const newBrowser: T_Browser = {
                    id: browserToken,
                    chats: []
                }

                // await fs.promises.writeFile(filePath, JSON.stringify(newBrowser))
                const createResponse = await DOSpacesServices.uploadObject(
                    DigitalOceanConstants.bucketName, // Nombre del bucket
                    fileKey,                          // Key del archivo
                    JSON.stringify(newBrowser)        // Contenido del archivo
                )
                const { error: createError } = createResponse
    
                if (createError) {
                    throw createError
                }

                return { data: newBrowser, error: null }
            }

            return getCommonErrorObject({
                name: 'ExistingBrowser',
                description: 'The browser already exists'
            })
        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async getBrowser(browserToken: string) {
        try {
            const exist = this.existBrowser(browserToken)

            if (!exist) return getCommonErrorObject({
                name: 'NonExistingBrowser',
                description: 'The browser does not exist'
            })

            const fileKey = this.getFileKey( browserToken)

            // Obtengo los datos existentes
            const response = await DOSpacesServices.downloadFile(DigitalOceanConstants.bucketName, fileKey)
            const { data: existingData, error } = response
            
            if (error) {
                throw error
            }

            // Ya confirmé que existe el archivo
            const browser = JSON.parse(existingData as string) as T_Browser
    
            return { data: browser, error: null }

        } catch(error) {
            return getCommonErrorObject(error as Error)
        }
    }

    async getChats(browserToken: string) {
        const response = await this.getBrowser(browserToken)
        const { data, error } = response

        if (error) {
            return response
        }

        const chats = (data as T_Browser).chats

        return { data: chats, error: null }
    }

    async addChat (browserToken: string, chatToken: string) {
        const response = await this.updateBrowser(browserToken, (browser) => {
            browser.chats.push(chatToken)
            return browser
        })

        return response
    }

    async hasChat(browserToken: string, chatToken: string) {
        const response = await this.getBrowser(browserToken)
        const { data, error } = response

        if (error) return false

        const chats       = (data as T_Browser).chats
        const isInBrowser = chats.find((value) => value === chatToken)

        return !!isInBrowser
    }
}
