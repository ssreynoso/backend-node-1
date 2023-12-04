import { T_Message } from './messages'

export type T_Browsers = Map<string, T_Chats>

export type T_Chats = Map<string, T_Chat>

export type T_Chat = {
    id         : string,
    sources    : T_ChatSource[]
    messages   : T_Message[]
    lastMessage: T_Message
}

export type T_ChatSource = {
    id      : string
    title   : string
    path    : string
    fileName: string
}

export type T_UpdateChatCallback = (chat: Readonly<T_Chat>) => T_Chat