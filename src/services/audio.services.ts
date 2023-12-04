import { config } from '../config'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

// En realidad el singleton no me sirve para nada pero quería ver que onda jeje
export class AudioServices {
    private static instance: AudioServices

    static getInstance() {
        if (!AudioServices.instance) {
            AudioServices.instance = new AudioServices()
        }
        return AudioServices.instance
    }

    getTranscriptedText(file: Express.Multer.File) {
        const model = 'whisper-1'

        const formData = new FormData()
        formData.append('model', model)
        formData.append('file', fs.createReadStream(file.path))

        const headers = {
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        }

        return fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: headers,
            body: formData
        }).then((response) => response.json())
    }
}
