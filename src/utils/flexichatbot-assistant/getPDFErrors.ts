import { PDFErrors } from '../../constants/errors/pdf'
import { ErrorClass } from '../../types/flexichatbot-assistant/errors'
import { getPDFDetails } from './getPDFDetails'

export const getPDFErrors = async function (pdfFile: Express.Multer.File): Promise<Error | null> {
    const { pdfDetails, error } = await getPDFDetails(pdfFile)            

    if (error) return error
    if (!pdfDetails) return new Error()

    if (pdfDetails.fileSize > 10) {
        return new ErrorClass('SizeValidationError', PDFErrors.SizeValidationError)
    }

    if (pdfDetails.pagesCount > 120) {
        return new ErrorClass('PagesValidationError', PDFErrors.PagesValidationError)
    }

    return null
}
