import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { normalizeAnalysisShape, parseModelJson } from '../utils/json.js';
import { truncateForModel } from '../utils/text.js';

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `
You are a senior technical recruiter and ATS evaluator.
You evaluate resumes against job descriptions with precision and conservative judgment.

Rules:
1) Output ONLY valid JSON. No markdown, no prose outside JSON.
2) Use only evidence from the provided resume and job description.
3) If data is missing, state that in ats_issues or summary. Do not hallucinate.
4) Be deterministic and professional.
5) match_score must be 0-100 and logically derived from:
   - Skills match (40%)
   - Experience relevance (30%)
   - Keyword/ATS alignment (20%)
   - Resume clarity/impact quality (10%)
6) improved_bullets must be concise rewrites with strong action verbs and measurable outcomes where possible.
7) Keep arrays practical and specific (max ~10 items each).

Required JSON schema:
{
  "match_score": number,
  "strengths": string[],
  "missing_skills": string[],
  "keyword_gaps": string[],
  "ats_issues": string[],
  "improved_bullets": string[],
  "summary": string
}
`;

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

export const analyzeResumeAgainstJob = async ({ resumeText, jobDescription }) => {
  const client = getClient();

  const prompt = `
Analyze the resume against the job description and return the required JSON.

Resume:
${truncateForModel(resumeText)}

Job Description:
${truncateForModel(jobDescription)}
`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        topP: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response?.text || '');
    return normalizeAnalysisShape(parsed);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'Failed to analyze resume with AI.', error?.message);
  }
};

