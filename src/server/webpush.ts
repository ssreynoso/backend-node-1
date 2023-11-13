import webpush from 'web-push'
import { config } from '../config'

type WebpushTemplate = { title: string, message: string }
type WebpushResponse = { success: boolean, error: string | null }
type WebpushSubscription = { id: string, subscription: webpush.PushSubscription }

export class WebPushServices {
    private server: typeof webpush
    private pushSubscriptions: Map<string, WebpushSubscription[]>
    private static instance: WebPushServices

    private constructor() {
        this.server = webpush
        this.server.setVapidDetails(
            'mailto:santiagoreynoso@neuronic.com',
            config.PUBLIC_VAPID_KEY,
            config.PRIVATE_VAPID_KEY,
        )
        this.pushSubscriptions = new Map()
    }

    static getInstance() {
        if (!WebPushServices.instance) {
            WebPushServices.instance = new WebPushServices()
        }
        return WebPushServices.instance
    }

    addSubscription(token: string, subscription: WebpushSubscription) {
        const subscriptions = this.pushSubscriptions.get(token)

        if (subscriptions) {
            // Compruebo si el cliente ya esta suscrito
            const indexElement = subscriptions.findIndex(item => (item.id === subscription.id))
            // Si NO esta suscrito, lo agrego al array de suscripciones
            if (indexElement === -1) {
                subscriptions.push(subscription)
                this.pushSubscriptions.set(token, subscriptions)
            } else {
                // Actualizo la suscripción de ese elemento
                subscriptions[indexElement] = subscription
            }
            return
        }

        const newSubscriptions = [subscription]
        this.pushSubscriptions.set(token, newSubscriptions)
    }
    
    async sendNotification(token: string, template: WebpushTemplate): Promise<WebpushResponse> {
        const subscriptions = this.pushSubscriptions.get(token)

        if (subscriptions) {
            for (let i = 0; i < subscriptions.length; i++) {
                try {
                    await this.server.sendNotification(subscriptions[i].subscription, JSON.stringify(template))
                } catch(error) {
                    console.log(`Error al enviar notificación a la suscripción: ${subscriptions[i].id}`, error)
                }
            }
            return { success: true, error: null }
        }
        return { success: false, error: 'No hay suscripciones para el token recibido.' }
    }
}