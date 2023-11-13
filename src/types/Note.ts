export type T_Note = {
    NotaDescripcion: string
    NotaEmpCod: string
    NotaEntidadID: string
    NotaTIpoEntidad: string
}

export type T_NoteSuccessResponse = { NotaSDT?: T_Note, ErrorCod: number, ErrorMsg: string }
export type T_NoteErrorResponse = { error: unknown }
export type T_NoteResponse = T_NoteSuccessResponse | T_NoteErrorResponse