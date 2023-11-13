import { Router } from 'express'
import { WebPushServices } from '../../server/webpush'

const router = Router()
const webPushServices = WebPushServices.getInstance()

router.post('/subscription', async (req, res) => {
    const { token, subscription } = req.body
    webPushServices.addSubscription(token, subscription)
    res.status(200).json({ success: true })
})

router.post('/', async (req, res) => {
    const { token, template } = req.body
    try {
        const response = await webPushServices.sendNotification(token, template)
        res.status(200).json(response)
    } catch (err) {
        console.log('Ha ocurrido un error al enviar la notificacion', err)
        res.status(500).json({
            error: {
                name: (err as Error).name,
                message: (err as Error).message
            }
        })
    }
})

export default router