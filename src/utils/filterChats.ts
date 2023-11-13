import { T_Chat } from '../types/Chat'

export const FilterChats = function (chats: T_Chat[], filterValue: string): T_Chat[] {
    let filteredChats: T_Chat[] = []

    if (filterValue.length > 0) {
        filteredChats = chats.filter((chat) => {
            const chatUser   = chat.UsuarioDescripcion.toLowerCase()
            const chatNumber = chat.UsuarioTelefono
            return chatUser.includes(filterValue.toLowerCase()) || chatNumber.includes(filterValue.toLowerCase())
        })
    } else {
        filteredChats = chats
    }

    return filteredChats
}
