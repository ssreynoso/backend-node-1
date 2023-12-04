import { IPerson } from '../types/person'

export const getCompanyPeopleRoomKey = (empToken: string, person: IPerson) => {
    return `${empToken}-${person.PersonaId}`
}
