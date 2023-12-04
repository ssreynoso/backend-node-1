import { ErrorClass } from '../types/errors'

type T_CommonErrorObject = {
    data: null
    error: {
        name: string
        description: string
    }
}

export type T_ErrorObject = {
    name: string
    description: string
}

// export function getCommonErrorObject(error: Error): T_CommonErrorObject
// export function getCommonErrorObject(error: T_ErrorObject): T_CommonErrorObject
export function getCommonErrorObject(error: Error | T_ErrorObject): T_CommonErrorObject {
    if (error instanceof Error) {
        return {
            data: null,
            error: {
                name: error.name,
                description: error.message,
            },
        }
    } else if (error.name && error.description) {
        return {
            data: null,
            error: {
                name: error.name,
                description: error.description,
            },
        }
    }

    throw new Error('Invalid error object')
}

export function getResponseErrorObject(error: unknown): T_ErrorObject {
    if (error instanceof ErrorClass) {
        return {
            name: error.name,
            description: error.details
        }
    }

    return {
        name: (error as Error).name,
        description: (error as Error).message
    }
}
