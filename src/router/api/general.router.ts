import express, { Request, Response } from 'express'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    res.json({ server_state: true })
})

export default router
