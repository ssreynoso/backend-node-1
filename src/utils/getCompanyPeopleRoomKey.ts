import { IPerson } from '../types/Person'

export const getCompanyPeopleRoomKey = (empToken: string, person: IPerson) => {
    return `${empToken}-${person.PersonaId}`
}
