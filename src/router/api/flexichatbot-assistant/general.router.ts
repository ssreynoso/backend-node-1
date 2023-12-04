import express, { Request, Response } from 'express'
import { config } from '../../../config'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    res.json({ server_state: true })
})

router.get('/whatsapp', async (req: Request, res: Response) => {
    res.json({
        number: config.WHATSAPP_NUMBER,
        message: config.WHATSAPP_MESSAGE
    })
})

export default router
