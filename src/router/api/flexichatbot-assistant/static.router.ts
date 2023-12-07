import express from 'express'
import { paths } from '../../../constants/paths'
import { DigitalOceanSpacesServices } from '../../../services/digital_ocean_spaces.services'

const staticRouter = express.Router()
const DOSpacesServices = DigitalOceanSpacesServices.getInstance()

staticRouter.get('/images/:file', (req, res) => {
    const file       = req.params.file
    const pathToFile = `${paths.staticFiles}/images/${file}`
    res.sendFile(pathToFile)
})

staticRouter.get('/pdf/:file', async (req, res) => {
    const file       = req.params.file
    const bucketName = 'flexichatbot-assistant'
    const fileKey    = `pdfs/${file}.pdf`

    // Consulta a digital ocean sobre el stream del pdf.
    const { data, error } = await DOSpacesServices.getPDFStream(bucketName, fileKey)
    if (error) {
        console.log(error)
        res.status(404).json({
            error: {
                name: (error as Error).name,
                message: (error as Error).message
            }
        })
        return
    }

    const pdfStream = data as NodeJS.ReadableStream

    // Configura los encabezados de respuesta adecuados para un archivo PDF
    res.setHeader('Content-Disposition', `attachment; filename="${file}"`)
    res.setHeader('Content-Type', 'application/pdf')

    // Envía el flujo del archivo PDF como respuesta
    pdfStream.pipe(res)
})

export default staticRouter