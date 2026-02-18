import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';
import { normalizeText } from '../utils/text.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { analyzeResumeAgainstJob } from '../services/resumeAnalyzerService.js';
import { fetchLatestRelevantOpenPositions } from '../services/jobMarketService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file?.mimetype === 'application/pdf';
    const isPdfName = /\.pdf$/i.test(file?.originalname || '');

    if (!isPdfMime && !isPdfName) {
      return cb(new ApiError(400, 'Only PDF resumes are supported.'));
    }

    return cb(null, true);
  },
});

router.post(
  '/analyze-resume',
  requireAuth,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Resume PDF is required in form field "resume".');
    }

    const jobDescription = normalizeText(req.body?.jobDescription || '');
    if (!jobDescription) {
      throw new ApiError(400, 'Job description is required.');
    }

    if (jobDescription.length < 60) {
      throw new ApiError(400, 'Job description is too short. Please provide more detail.');
    }

    const rawResumeText = await extractTextFromPdf(req.file.buffer);
    const resumeText = normalizeText(rawResumeText);

    if (!resumeText || resumeText.length < 80) {
      throw new ApiError(400, 'Could not extract sufficient text from the PDF resume.');
    }

    const analysis = await analyzeResumeAgainstJob({
      resumeText,
      jobDescription,
    });
    const latestOpenPositions = await fetchLatestRelevantOpenPositions({
      analysis,
      jobDescription,
    });

    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        latest_open_positions: latestOpenPositions,
      },
      meta: {
        resume_characters: resumeText.length,
        job_description_characters: jobDescription.length,
      },
    });
  })
);

export { router as resumeAnalyzerRoutes };

