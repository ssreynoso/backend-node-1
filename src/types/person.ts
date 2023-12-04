export enum Roles {
    Null,
    Encargado,
    Admin,
    Usuario
}

export interface IPerson {
    PersonaApellido:      string;
    PersonaApprovalIDMP:  string;
    PersonaAutenticacion: boolean;
    PersonaCelular:       string;
    PersonaClave:         string;
    PersonaCompleto:      string;
    PersonaFechaAlta:     string;
    PersonaFechaBaja:     string;
    PersonaId:            string;
    PersonaMail:          string;
    PersonaMailMP:        string;
    PersonaNombre:        string;
    PersonaUsuario:       string;
    PersonaRolId:         Roles;
}

export interface IPersonSegment {
    PersonaId:                 string;
    PersonaSegmentoEmpCod:     string;
    PersonaSegmentoHabilitado: boolean;
    SegmentoId:                string;
}
