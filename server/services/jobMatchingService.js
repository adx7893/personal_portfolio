import { normalizeText } from '../utils/text.js';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'have', 'will', 'you', 'are',
  'our', 'their', 'has', 'all', 'can', 'not', 'but', 'who', 'what', 'when', 'where', 'why',
  'how', 'into', 'about', 'job', 'role', 'work', 'team', 'years', 'experience',
]);

const tokenize = (value) =>
  normalizeText(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

export const computeJobMatch = ({ resumeText, jobDescription }) => {
  const resumeTokens = new Set(tokenize(resumeText));
  const jobTokens = new Set(tokenize(jobDescription));

  if (!resumeTokens.size || !jobTokens.size) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      tag: 'Low Match',
    };
  }

  const matchedKeywords = [...jobTokens].filter((token) => resumeTokens.has(token)).slice(0, 20);
  const missingKeywords = [...jobTokens].filter((token) => !resumeTokens.has(token)).slice(0, 20);

  const matchPercentage = Math.min(100, Math.round((matchedKeywords.length / jobTokens.size) * 100));
  const tag =
    matchPercentage >= 70 ? 'High Match' : matchPercentage >= 40 ? 'Moderate Match' : 'Low Match';

  return { matchPercentage, matchedKeywords, missingKeywords, tag };
};
