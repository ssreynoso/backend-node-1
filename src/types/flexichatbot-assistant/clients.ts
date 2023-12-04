export type T_DayControl = {
    day: string,
    pdfsUploaded: number
    questionsRequested: number
}

export type T_Client = {
    ip: string
    devices: string[]
    browsers: string[]
    suscription: 'free' | 'pro'
    dayControls: T_DayControl[]
}

export type PartialT_Client = Partial<T_Client> & Required<Pick<T_Client, 'ip'>>;

export type T_GetClientResponse = {
    success: boolean
    client: T_Client | null
    error?: Error
}

export type T_UpdateClientCallback = (browser: Readonly<T_Client>) => T_Client
