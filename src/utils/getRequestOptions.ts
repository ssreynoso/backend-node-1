export const getRequestOptions = function (method: string, body: object) {
    return {
        method: method,
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json',
        },
    }
}
