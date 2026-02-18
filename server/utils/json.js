import { ApiError } from './errors.js';

export const parseModelJson = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new ApiError(502, 'AI response was empty.');
  }

  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new ApiError(502, 'AI response was not valid JSON.');
  }
};

export const normalizeAnalysisShape = (analysis) => {
  const normalizeStringArray = (value) =>
    Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

  const matchScore = Number.isFinite(Number(analysis?.match_score))
    ? Math.min(100, Math.max(0, Math.round(Number(analysis.match_score))))
    : 0;

  return {
    match_score: matchScore,
    strengths: normalizeStringArray(analysis?.strengths),
    missing_skills: normalizeStringArray(analysis?.missing_skills),
    keyword_gaps: normalizeStringArray(analysis?.keyword_gaps),
    ats_issues: normalizeStringArray(analysis?.ats_issues),
    improved_bullets: normalizeStringArray(analysis?.improved_bullets),
    summary: typeof analysis?.summary === 'string' ? analysis.summary : '',
  };
};

