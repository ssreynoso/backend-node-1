import express from 'express'
import multer from 'multer'
import { paths } from '../../constants/paths'
import { AudioServices } from '../../services/audio.services'

// Configuración de multer para almacenar los archivos en una carpeta específica
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${paths.staticFiles}/uploads`) // Carpeta donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Mantener el nombre original del archivo
    }
})
  
// Crear el middleware de multer
const upload = multer({ storage })

const router = express.Router()

router.post('/', upload.single('audio'), async (req, res) => {
    try {
        const result: { success?: boolean } = { success: true }

        if (req.file) {
            const audioServices = AudioServices.getInstance()

            audioServices.getTranscriptedText(req.file)
                .then(response => {
                    res.status(200).json({
                        success: result.success || false,
                        text: response.text
                    })
                })
                .catch(error => {
                    console.error('Error:', error)
                    throw new Error('Ha ocurrido un error')
                })
        } else {
            throw new Error('No se ha encontrado un audio')
        }

    } catch (err) {
        console.error(err)
        const error = err as Error
        res.status(404).json({ 
            success: false,
            error: {
                name: error.name,
                message: error.message
            },
        })
    }
})

export default router
