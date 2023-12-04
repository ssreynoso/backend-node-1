import { IPerson, Roles } from '../types/person'

export const isAdministrator = (person: IPerson | null) => {
    return person ? person.PersonaRolId === Roles.Admin || person.PersonaRolId === Roles.Encargado : false
}

