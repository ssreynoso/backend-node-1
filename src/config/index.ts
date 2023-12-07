import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
    APP_PORT         : process.env.PORT || '8088',
    API_URL          : process.env.API_URL || '',
    API_TOKEN        : process.env.API_TOKEN || '',
    OPENAI_API_KEY   : process.env.OPENAI_API_KEY || '',
    SYSTEM_CONTENT   : process.env.SYSTEM_CONTENT || '',
    PYTHON_SERVER    : process.env.PUBLIC_PROCESS_FILES_SERVER,
    WHATSAPP_NUMBER  : process.env.WHATSAPP_NUMBER,
    WHATSAPP_MESSAGE : process.env.WHATSAPP_MESSAGE,
    PUBLIC_VAPID_KEY : process.env.PUBLIC_VAPID_KEY || '',
    PRIVATE_VAPID_KEY: process.env.PRIVATE_VAPID_KEY || '',
    SPACES_KEY       : process.env.SPACES_KEY,
    SPACES_SECRET    : process.env.SPACES_SECRET,
    ACCESS_TOKEN     : process.env.ACCESS_TOKEN,
}