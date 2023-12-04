import { v4 } from 'uuid'

export const getUUID = function(): string {
    return v4()
}