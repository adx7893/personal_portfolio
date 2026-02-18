import mammoth from 'mammoth';
import { extractTextFromPdf } from './pdfService.js';
import { ApiError } from '../utils/errors.js';
import { normalizeText } from '../utils/text.js';

const isDocxFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  const name = (file?.originalname || '').toLowerCase();
  return (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  );
};

const isPdfFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  const name = (file?.originalname || '').toLowerCase();
  return mime === 'application/pdf' || name.endsWith('.pdf');
};

export const extractTextFromResumeUpload = async (file) => {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new ApiError(400, 'A resume file is required.');
  }

  if (isPdfFile(file)) {
    const text = await extractTextFromPdf(file.buffer);
    const normalized = normalizeText(text);
    if (!normalized) {
      throw new ApiError(400, 'Could not extract readable text from the uploaded PDF.');
    }
    return normalized;
  }

  if (isDocxFile(file)) {
    try {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      const normalized = normalizeText(parsed?.value || '');
      if (!normalized) {
        throw new ApiError(400, 'Could not extract readable text from the uploaded DOCX.');
      }
      return normalized;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Failed to read the uploaded DOCX file.');
    }
  }

  throw new ApiError(400, 'Only PDF and DOCX resumes are supported.');
};
