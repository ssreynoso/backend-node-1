import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
    APP_PORT         : process.env.PORT || '8088',
    OPENAI_API_KEY   : process.env.OPENAI_API_KEY || '',
    SPACES_KEY       : process.env.SPACES_KEY,
    SPACES_SECRET    : process.env.SPACES_SECRET,
    PUBLIC_VAPID_KEY : process.env.PUBLIC_VAPID_KEY || '',
    PRIVATE_VAPID_KEY: process.env.PRIVATE_VAPID_KEY || ''
}
