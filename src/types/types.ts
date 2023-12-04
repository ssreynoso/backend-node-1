export type QueryResult = {
    answer?: string
    error ?: string
}

export type MetaData = {
    document_title: string
    file_name: string
}

export type TextBlock = {
    isCodeBlock: boolean
    text: string
    language?: string
}