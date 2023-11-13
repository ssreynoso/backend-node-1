import express, { Application } from 'express'
import generalRouter            from './general.router'
import audioRouter              from './audio.router'
import filesRouter              from './files.router'
import webpushRouter            from './webpush.router'

export const routerApi = function (app: Application) {
    const router_api_v1 = express.Router()

    app.use('/api/v1', router_api_v1)

    router_api_v1.use('/', generalRouter)
    router_api_v1.use('/audio', audioRouter)
    router_api_v1.use('/files', filesRouter)
    router_api_v1.use('/webpush', webpushRouter)

    // router_api_v1.use('/<entity>', entity_router);
}
