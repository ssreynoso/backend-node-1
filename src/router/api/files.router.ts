import express from 'express'
import multer from 'multer'
import { paths } from '../../constants/paths'
import { DigitalOceanSpacesServices } from '../../services/digital_ocean_spaces.services'
import fs from 'fs/promises'
import path from 'node:path'

const router = express.Router()
const DOSpacesServices = DigitalOceanSpacesServices.getInstance()

// Configuración de multer para almacenar los archivos en una carpeta específica
// Crear el middleware de multer
type MulterFileFilter = (req: express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => void

const createUploadMiddleware = (destinationPath: string, fileFilterFunction?: MulterFileFilter) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, destinationPath) // Carpeta donde se guardarán los archivos
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname) // Mantener el nombre original del archivo
            }
        }),
        fileFilter: fileFilterFunction
    })
}
const uploadImage = createUploadMiddleware(`${paths.staticFiles}/images`, function (req, file, cb) {
    // Verifica que el archivo tenga una extensión jpg o jpeg
    const allowedExtensions = /\.(jpg|jpeg)$/i
    const extensionCondition = allowedExtensions.test(path.extname(file.originalname))
    if (!extensionCondition) {
        cb(new Error('El archivo debe ser en formato JPG o JPEG.'))
    }

    return cb(null, true)
})

const uploadFiles = createUploadMiddleware(`${paths.staticFiles}/uploads`, function (req, file, cb) {
    // Verifica que el archivo tenga una extensión jpg o jpeg
    const allowedExtensions = /\.(pdf)$/i
    const extensionCondition = allowedExtensions.test(path.extname(file.originalname))
    if (!extensionCondition) {
        cb(new Error('El archivo debe ser en formato PDF.'))
    }

    return cb(null, true)
})

router.post('/document',
    uploadFiles.single('document'),
    async (req, res) => {
        try {
            if (req.file) {
                const filePath = `${paths.staticFiles}/uploads/${req.file.originalname}`

                // Controlo el tamaño del archivo
                const fileSizeMB = (req.file.size / (1024 * 1024))
                const sizeCondition = fileSizeMB < 16
                if (!sizeCondition) {
                    // Elimino el archivo local
                    await fs.unlink(filePath)
                    throw new Error('El archivo debe pesar menos de 16MB.')
                }

                const bucketName = 'flexichatbot-space'
                const fileKey    = `flexichatbot-uploads/${req.file.originalname}`

                // Subo la imagen a digital ocean
                const { error } = await DOSpacesServices.uploadFile(bucketName, fileKey, filePath, 'application')
                if (error) { throw error }

                // Elimino la imagen local
                await fs.unlink(filePath)

                // Devuelvo la URL temporal en el servidor de digital ocean
                const { data: fileUrl, error: urlError } = await DOSpacesServices.generatePresignedUrl(bucketName, fileKey)
                if (urlError) { throw urlError }

                console.log(fileUrl)

                res.status(200).json({
                    data: {
                        fileName: req.file.originalname,
                        fileUrl
                    },
                    error: null
                })
            } else {
                throw new Error('No se ha encontrado un documento')
            }

        } catch (err) {
            console.error(err)
            const error = err as Error
            res.status(404).json({ 
                data: null,
                error: {
                    name: error.name,
                    message: error.message
                },
            })
        }
    }
)

router.post('/image',
    uploadImage.single('image'),
    async (req, res) => {
        try {
            if (req.file) {
                const filePath = `${paths.staticFiles}/images/${req.file.originalname}`

                // Controlo el tamaño del archivo
                const fileSizeMB = (req.file.size / (1024 * 1024))
                const sizeCondition = fileSizeMB < 16
                if (!sizeCondition) {
                    // Elimino la imagen local
                    await fs.unlink(filePath)
                    throw new Error('El archivo debe pesar menos de 16MB.')
                }

                const bucketName = 'flexichatbot-space'
                const fileKey    = `flexichatbot-uploads/${req.file.originalname}`

                // Subo la imagen a digital ocean
                const { error } = await DOSpacesServices.uploadFile(bucketName, fileKey, filePath, 'image')
                if (error) { throw error }

                // Elimino la imagen local
                await fs.unlink(filePath)

                // Devuelvo la URL temporal en el servidor de digital ocean
                const { data: fileUrl, error: urlError } = await DOSpacesServices.generatePresignedUrl(bucketName, fileKey)
                if (urlError) { throw urlError }

                console.log('fileUrl image', fileUrl)

                res.status(200).json({
                    data: {
                        fileName: req.file.originalname,
                        fileUrl
                    },
                    error: null
                })
            } else {
                throw new Error('No se ha encontrado una imagen')
            }

        } catch (err) {
            console.error(err)
            const error = err as Error
            res.status(404).json({ 
                data: null,
                error: {
                    name: error.name,
                    message: error.message
                },
            })
        }
    }
)

export default router
