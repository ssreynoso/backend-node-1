

export type T_User = {
    UsuarioApellido: string
    UsuarioChatID: string
    UsuarioDNI: string
    UsuarioDescripcion: string
    UsuarioEmpCod: string
    UsuarioFBID: string
    UsuarioID: string
    UsuarioIGID: string
    UsuarioMail: string
    UsuarioNombre: string
    UsuarioTGID: string
    UsuarioTelefono: string
    UsuarioTipoDoc: string
}

export type T_GetUserSuccessResponse = { user: T_User }
export type T_GetUserErrorResponse = { error: unknown }
export type T_GetUserResponse = T_GetUserSuccessResponse | T_GetUserErrorResponse
