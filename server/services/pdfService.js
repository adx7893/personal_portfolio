import pdfParse from 'pdf-parse';
import { ApiError } from '../utils/errors.js';

export const extractTextFromPdf = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new ApiError(400, 'A valid PDF file is required.');
  }

  try {
    const parsed = await pdfParse(buffer);
    return parsed?.text || '';
  } catch {
    throw new ApiError(400, 'Failed to read the uploaded PDF.');
  }
};

