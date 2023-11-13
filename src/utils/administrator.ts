import { IPerson, Roles } from '../types/Person'

export const isAdministrator = (person: IPerson | null) => {
    return person ? person.PersonaRolId === Roles.Admin || person.PersonaRolId === Roles.Encargado : false
}

