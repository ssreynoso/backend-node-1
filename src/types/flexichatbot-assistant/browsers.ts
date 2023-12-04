export type T_Browser = {
    id: string
    chats: string[]
}

export type T_UpdateBrowserCallback = (browser: Readonly<T_Browser>) => T_Browser