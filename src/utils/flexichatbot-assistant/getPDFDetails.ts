import { T_PDFFile } from '../types/pdf'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'

type T_PDFDetailsResponse = { pdfDetails: T_PDFFile | null, error: Error | null}

export const getPDFDetails = async function(file: Express.Multer.File): Promise<T_PDFDetailsResponse> {
    try {
        const arrayBuffer = await fs.promises.readFile(file.path)
        const uint8Array  = new Uint8Array(arrayBuffer)
        const pdfDoc      = await PDFDocument.load(uint8Array, { ignoreEncryption: true })
        const size        = pdfDoc.getPage(0).getSize()

        const pdfDetails = {
            pagesCount: pdfDoc.getPageCount(),
            pageWidth : size.width,
            pageHeight: size.height,
            fileSize  : (file.size / 1024) / 1024 // Tamaño en megabytes
        }

        return { pdfDetails: pdfDetails, error: null }
    } catch(error) {
        const custom_error = new Error (`Ha ocurrido un error al leer el archivo: ${(error as Error).name}, ${(error as Error).message}`)
        return { pdfDetails: null, error: custom_error }
    }
}