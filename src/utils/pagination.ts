export const getPagination = function <T>(collection: T[], limit: string, offset: string): T[] {
    if (isNaN(parseInt(limit)) || isNaN(parseInt(offset))) {
        return collection
    }
    const start = parseInt(offset)
    const end   = start + parseInt(limit)
    
    return end < collection.length ? collection.slice(start, end) : collection.slice(start, end)
}
