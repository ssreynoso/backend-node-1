export class ErrorClass extends Error {
    private _details: string

    constructor(name: string, details: string) {
        super(name)
        this._details = details
    }

    get details() {
        return this._details
    }
}