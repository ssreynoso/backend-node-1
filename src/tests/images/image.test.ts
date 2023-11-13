import path from 'path'
import { DigitalOceanSpacesServices } from '../../services/digital_ocean_spaces.services'

const DOSpacesServices = DigitalOceanSpacesServices.getInstance()
const bucketName = 'flexichatbot-space'
const filePath = path.join(__dirname, './test.jpeg')
const fileKey  = 'flexichatbot-images/test/test.jpeg'

// Por ahora son un poco precarios los test pero bueno ya vamos a ir mejorando je

test('Upload a image test', async () => {
    const response = await DOSpacesServices.uploadFile(bucketName, fileKey, filePath, 'image')
    console.log(response)
    expect(response.error).toBeNull()
})

test('Get temporal url for remote image test', async () => {
    const response = await DOSpacesServices.generatePresignedUrl(bucketName, fileKey)
    console.log(response)
    expect(response.error).toBeNull()
})

// test('Delete a remote image test', async () => {
//     const response = await DOSpacesServices.deleteFile(bucketName, fileKey)
//     expect(response.error).toBeNull()
// })