export type T_Segment = {
    SegmentoId               : string
    SegmentoDescripcion      : string
    SegmentoEstado           : string
    UsuarioSegmentoHabilitado: boolean
}

export type T_GetUserSegmentSuccessResponse = { segments: T_Segment[] }
// export type T_GetUserSegmentErrorResponse = { error: unknown }
export type T_GetUserSegmentErrorResponse = string
export type T_GetUserSegmentResponse =
    | T_GetUserSegmentSuccessResponse
    | T_GetUserSegmentErrorResponse
