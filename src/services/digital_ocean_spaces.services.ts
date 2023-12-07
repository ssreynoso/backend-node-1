import { 
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListBucketsCommand,
    ListObjectsCommand,
    ObjectCannedACL,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
    S3ClientConfig
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import { config } from '../config'
import { streamToStringAWS } from '../utils/streamToStringAWS'
import { writeFile } from 'fs/promises'
import path from 'path'

dotenv.config()

const S3ClientConfig = {
    endpoint: 'https://fra1.digitaloceanspaces.com', // Find your endpoint in the control panel, under Settings. Prepend "https://".
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    region: 'fra1', // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
    credentials: {
        accessKeyId: config.SPACES_KEY, // Access key pair. You can create access key pairs using the control panel or API.
        secretAccessKey: config.SPACES_SECRET, // Secret access key defined through an environment variable.
    }
}

export class DigitalOceanSpacesServices {
    private static instance: DigitalOceanSpacesServices

    client: S3Client

    private constructor() {
        // Me da errores de tipos pero en JS me funcionaba... Por eso el 'as'
        this.client = new S3Client(S3ClientConfig as S3ClientConfig)
    }

    static getInstance() {
        if (!DigitalOceanSpacesServices.instance) {
            DigitalOceanSpacesServices.instance = new DigitalOceanSpacesServices()
        }
        return DigitalOceanSpacesServices.instance
    }

    async listAllBuckets() {
        try {
            const data = await this.client.send(new ListBucketsCommand({}))
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async listAllFiles(bucketName: string) {
        try {
            const data = await this.client.send(
                new ListObjectsCommand({ Bucket: bucketName })
            )
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async existFile(bucketName: string, fileKey: string) {
        const bucketParams = { Bucket: bucketName, Key: fileKey }

        try {
            await this.client.send(new HeadObjectCommand(bucketParams))
            return true
        } catch (err) {
            const error = err as Error
            if (error.name === 'NotFound') {
                // La excepción NotFound indica que el objeto no existe
                return false
            } else {
                // Otras excepciones pueden indicar un problema de permisos, conectividad, etc.
                throw err
            }
        }
    }

    async downloadFile(bucketName: string, fileKey: string, finalFilePath?: string) {
        const bucketParams = {
            Bucket: bucketName,
            Key: fileKey,
        }

        try {
            const response = await this.client.send(new GetObjectCommand(bucketParams))
            const data     = await streamToStringAWS(response.Body as NodeJS.ReadableStream)
            
            if (finalFilePath) {
                await writeFile(finalFilePath, data)
            }

            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async getPDFStream(bucketName: string, fileKey: string) {
        const bucketParams = {
            Bucket: bucketName,
            Key: fileKey,
        }

        try {
            const response = await this.client.send(new GetObjectCommand(bucketParams))

            return { data: response.Body as NodeJS.ReadableStream, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async uploadObject(bucketName: string, fileKey: string, body: string) {
        const params = {
            Bucket: bucketName, // The path to the directory you want to upload the object to, starting with your Space name.
            Key: fileKey, // Object key, referenced whenever you want to access this file later.
            Body: body, // The object's contents. This variable is an object, not a string.
            ACL: 'private', // Defines ACL permissions, such as private or public.
            // Metadata: {
            //     // Defines metadata tags.
            //     'x-amz-meta-my-key': 'your-value',
            // },
        } as PutObjectCommandInput

        try {
            const data = await this.client.send(new PutObjectCommand(params))
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async uploadFile(bucketName: string, fileKey: string, filePath: string, mimeType: 'image' | 'application') {

        // Leer el contenido del archivo desde el archivo local.
        const fileContent = await fs.readFile(filePath)
        const fileExtension = path.extname(filePath).replace('.', '')

        const params = {
            Bucket: bucketName,
            Key   : fileKey,
            Body  : fileContent,   // Usar el contenido de la imagen como el cuerpo del objeto.
            ACL   : ObjectCannedACL.public_read, // Define los permisos ACL, como private o public-read.
            ContentType: `${mimeType}/${fileExtension}`
        } as PutObjectCommandInput
        
        try {
            const data = await this.client.send(new PutObjectCommand(params))
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async uploadPDF(bucketName: string, fileKey: string, filePath: string) {
        const fileContent = await fs.readFile(filePath)

        const params = {
            Bucket: bucketName, // The path to the directory you want to upload the object to, starting with your Space name.
            Key: fileKey,       // Object key, referenced whenever you want to access this file later.
            Body: fileContent,   // The object's contents. This variable is an object, not a string.
            ACL: ObjectCannedACL.private,     // Defines ACL permissions, such as private or public-read.
            ContentType: 'application/pdf'
            // Metadata: {
            //     // Defines metadata tags.
            //     'x-amz-meta-my-key': 'your-value',
            // },
        }

        try {
            const data = await this.client.send(new PutObjectCommand(params))
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    // Generates the URL.
    async generatePresignedUrl(bucketName: string, fileKey: string) {
        const bucketParams = {
            Bucket: bucketName,
            Key: fileKey
        }

        try {
            const url = await getSignedUrl(this.client, new GetObjectCommand(bucketParams), { expiresIn: 15 * 60 }) // Adjustable expiration.
            return { data: url, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }

    async deleteFile(bucketName: string, fileKey: string) {
        const params = {
            Bucket: bucketName,
            Key: fileKey,
        }
    
        try {
            const data = await this.client.send(new DeleteObjectCommand(params))
            return { data: data, error: null }
        } catch (err) {
            return { data: null, error: err }
        }
    }
}
