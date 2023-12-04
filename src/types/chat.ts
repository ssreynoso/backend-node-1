import { T_Message } from './message'

export type T_Chat = {
    CanalCodigo: string
    ChatsFechaUltMensaje: string
    ChatsId: string
    ChatsIgConvToken: string
    ChatsRequiereSoporte: boolean
    ChatsUltMensaje: string
    MovilId: string
    UsuarioDescripcion: string
    UsuarioId: string
    UsuarioTelefono: string
    PendingMessages: T_Message[]
}

export type T_GetChatsSuccessResponse = { chats: T_Chat[] }
export type T_GetChatsErrorResponse = { error: unknown }
export type T_GetChatsResponse = T_GetChatsSuccessResponse | T_GetChatsErrorResponse