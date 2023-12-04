import fs, { promises as fsPromises } from 'fs'
import path from 'path'

// export const existFile = async function (folder: string, fileName: string): Promise<boolean> {
export const existFile = async function (filePath: string): Promise<boolean> {
    try {
        await fsPromises.access(filePath, fs.constants.F_OK)
        return true
    } catch (err) {
        return false
    }
}

export const getExistingFiles = async function (directory: string): Promise<string[]> {
    try {
        const directoryFiles: string[] = []
        const files = await fsPromises.readdir(directory)

        const promises = files.map((file) => {
            const rutaArchivo = path.join(directory, file)

            return fsPromises.stat(rutaArchivo).then((stats) => {
                if (stats.isFile()) {
                    directoryFiles.push(file)
                }
            })
        })

        await Promise.all(promises)

        return directoryFiles
    } catch (err) {
        console.error('Error al leer el directorio:', err)
        throw err
    }
}