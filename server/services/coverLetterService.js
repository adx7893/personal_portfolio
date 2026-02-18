import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { parseModelJson } from '../utils/json.js';
import { normalizeText, truncateForModel } from '../utils/text.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

const ALLOWED_TONES = ['Professional', 'Confident', 'Friendly', 'Concise', 'Executive'];

const SYSTEM_PROMPT = `
You are a senior career coach and hiring manager.
Write strong, ATS-friendly, role-specific cover letters.

Rules:
1) Return only valid JSON with the required keys.
2) Keep the cover letter between 300 and 400 words.
3) Avoid generic filler and cliches.
4) Use concrete, role-relevant accomplishments from provided resume content.
5) Mention company and role explicitly.
6) Use selected tone while staying professional.
7) Include practical matched skills and improvement suggestions.

Required JSON schema:
{
  "coverLetter": string,
  "matchedSkills": string[],
  "suggestedImprovements": string[]
}
`;

const normalizeStringArray = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => normalizeText(item)).filter(Boolean)
    : [];

let aiClient;

const getClient = () => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return aiClient;
};

export const validateTone = (tone) => {
  if (!tone || typeof tone !== 'string') return 'Professional';
  return ALLOWED_TONES.includes(tone) ? tone : 'Professional';
};

export const generateCoverLetter = async ({
  company,
  role,
  jobDescription,
  resumeText,
  tone,
}) => {
  const client = getClient();

  const prompt = `
Generate a tailored cover letter in JSON format.

Company: ${company}
Role: ${role}
Tone: ${tone}

Job Description:
${truncateForModel(jobDescription, 30_000)}

Resume Text:
${truncateForModel(resumeText, 30_000)}
`;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        topP: 0.9,
        responseMimeType: 'application/json',
      },
    });

    const aiJson = parseModelJson(response?.text || '');

    const coverLetter = normalizeText(aiJson?.coverLetter || '');
    if (!coverLetter) {
      throw new ApiError(502, 'AI response did not include a valid cover letter.');
    }

    return {
      coverLetter,
      matchedSkills: normalizeStringArray(aiJson?.matchedSkills).slice(0, 15),
      suggestedImprovements: normalizeStringArray(aiJson?.suggestedImprovements).slice(0, 15),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'Failed to generate cover letter with Gemini.', error?.message);
  }
};

export { ALLOWED_TONES };
