export type T_Message = {
    MessageData: string
    MessageFrom: number
    MessageFecha: string
    MessageTipo: number
    MessageUrlImagen: string
    MessagesId: string
}

export type T_GetMessagesSuccessResponse = { messages: T_Message[] }
// export type T_GetMessagesErrorResponse = { error: unknown }
export type T_GetMessagesErrorResponse = string
export type T_GetMessagesResponse =
    | T_GetMessagesSuccessResponse
    | T_GetMessagesErrorResponse

export type T_GetQuicklyAnswerSuccessResponse = { RespuestasRapidas?: string[] }
// export type T_GetQuicklyAnswerErrorResponse = { error: unknown }
export type T_GetQuicklyAnswerErrorResponse = string
export type T_GetQuicklyAnswerResponse =
    | T_GetQuicklyAnswerSuccessResponse
    | T_GetQuicklyAnswerErrorResponse

export type T_PostMessagesSuccessResponse = { errorcod: number; errormsg: string }
// export type T_PostMessagesErrorResponse = { error: unknown }
export type T_PostMessagesErrorResponse = string
export type T_PostMessagesResponse =
    | T_PostMessagesSuccessResponse
    | T_PostMessagesErrorResponse

export type PostMessageParams = {
    empToken: string
    chatsID : number
    message : string
    fileUrl : string
    personId: number
} 