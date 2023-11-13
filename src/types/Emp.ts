export type T_GetEmpSuccessResponse = { EmpID: number }
export type T_GetEmpErrorResponse = { error: unknown }

export type T_GetEmpResponse = T_GetEmpSuccessResponse | T_GetEmpErrorResponse